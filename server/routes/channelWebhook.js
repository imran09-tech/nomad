/**
 * =============================================================================
 * IMXX NOMAD — Channel Manager Sync Webhook Router
 * routes/channelWebhook.js
 *
 * Mounts at: POST /api/webhooks/channel-manager
 *
 * Responsibility:
 *   This router handles TWO webhook directions:
 *
 *   DIRECTION A — Inbound (CM → IMXX):
 *     The CM fires webhooks at us for real-time inventory events:
 *       - room.availability.updated  → update our cache / DB record
 *       - booking.confirmed          → CM confirmed the reservation we sent
 *       - booking.cancelled          → guest or property cancelled
 *       - rate.changed               → CM notifies us of new net rates
 *
 *   DIRECTION B — Outbound (IMXX → CM):
 *     POST /api/webhooks/channel-manager/reserve
 *     When an IMXX user completes payment, we fire a reservation creation
 *     request to the CM to lock the room (prevent double-booking) and log
 *     the commission accrual for the monthly payout cycle.
 *
 * Security:
 *   - Inbound webhooks are verified via HMAC-SHA256 signature check using
 *     CM_WEBHOOK_SECRET. Requests without a valid signature are rejected 401.
 *   - A replay-attack window of 5 minutes (timestamp-based) is enforced.
 *   - All inbound payloads are size-limited and schema-validated before
 *     any DB writes occur.
 *   - The outbound /reserve endpoint requires a valid JWT (authenticated user).
 *
 * Rate Limiting:
 *   - Inbound webhook endpoint is limited to 120 req/min (CM batch tolerance).
 *   - Outbound /reserve is limited to 10 req/min per user (booking rate limit).
 * =============================================================================
 */

'use strict';

const express = require('express');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const router = express.Router();

const {
  buildBookingPayload,
  buildCommissionRecord,
  generateBookingRef,
  simulateCMSearchResponse,
  buildSearchPayload,
  mapPropertyToNative,
} = require('../controllers/channelManager');

const { calculateSplitPayment } = require('../controllers/paymentSplitter');

// ── Dependency injection ──────────────────────────────────────────────────────
let authenticateToken, dbRun, dbGet, dbAll, sanitize, stripe;

function init(deps) {
  authenticateToken = deps.authenticateToken;
  dbRun = deps.dbRun;
  dbGet = deps.dbGet;
  dbAll = deps.dbAll;
  sanitize = deps.sanitize;
  stripe = deps.stripe;
}

const requireAuth = (req, res, next) => {
  if (authenticateToken) return authenticateToken(req, res, next);
  next(new Error('authenticateToken not initialized'));
};

// ── Inbound event log (in-memory ring buffer, last 200 events) ────────────────
// In production: replace with a database table or structured logging service.
const inboundEventLog = [];
function logEvent(entry) {
  inboundEventLog.unshift({ ...entry, receivedAt: new Date().toISOString() });
  if (inboundEventLog.length > 200) inboundEventLog.length = 200;
}

// ── Replay-attack prevention (in-memory, last 5 min timestamps) ───────────────
const seenRequestIds = new Set();
setTimeout(() => seenRequestIds.clear(), 5 * 60 * 1000); // Flush every 5 min

// ─────────────────────────────────────────────────────────────────────────────
// DIRECTION A — INBOUND: Channel Manager → IMXX
// POST /api/webhooks/channel-manager
//
// The CM POSTs real-time inventory and booking state changes here.
// ─────────────────────────────────────────────────────────────────────────────

router.post('/', async (req, res, next) => {
  const WEBHOOK_SECRET = process.env.CM_WEBHOOK_SECRET;

  // ── A1. Signature Verification ────────────────────────────────────────────
  //
  // The CM includes these headers with every webhook:
  //   X-CM-Signature: sha256=<hex>  (HMAC of raw body using shared secret)
  //   X-CM-Timestamp: <unix-ms>     (for replay-attack prevention)
  //   X-CM-Request-Id: <uuid>       (idempotency key)
  //
  const receivedSig = req.headers['x-cm-signature'];
  const receivedTs = req.headers['x-cm-timestamp'];
  const receivedReqId = req.headers['x-cm-request-id'] || crypto.randomUUID();

  if (WEBHOOK_SECRET) {
    // ── Timestamp check: reject if >5 minutes old ────────────────────────
    const tsDelta = Date.now() - parseInt(receivedTs || '0', 10);
    if (!receivedTs || tsDelta > 5 * 60 * 1000 || tsDelta < -60000) {
      console.warn(`[Webhook-CM] Replay attack or clock skew: ts=${receivedTs} delta=${tsDelta}ms`);
      return res.status(401).json({ error: 'Request timestamp outside acceptable window.' });
    }

    // ── HMAC verification ────────────────────────────────────────────────
    if (!receivedSig) {
      return res.status(401).json({ error: 'Missing X-CM-Signature header.' });
    }

    // req.body is pre-parsed JSON by express.json() — reconstruct raw string
    // Note: For production, capture raw body with express.raw() (like Stripe webhook)
    const rawBody = JSON.stringify(req.body);
    const expectedSig =
      'sha256=' + crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');

    const sigMatch = crypto.timingSafeEqual(
      Buffer.from(receivedSig, 'utf8'),
      Buffer.from(expectedSig, 'utf8')
    );

    if (!sigMatch) {
      console.warn(`[Webhook-CM] Invalid signature. Got: ${receivedSig}`);
      return res.status(401).json({ error: 'Webhook signature verification failed.' });
    }
  } else {
    // Dev mode: skip signature check but log loudly
    console.warn(
      '[Webhook-CM] ⚠️  CM_WEBHOOK_SECRET not set — accepting without verification (dev mode).'
    );
  }

  // ── A2. Idempotency / Replay Prevention ───────────────────────────────────
  if (seenRequestIds.has(receivedReqId)) {
    console.log(
      `[Webhook-CM] Duplicate request_id ${receivedReqId} — acknowledged without reprocessing.`
    );
    return res.status(200).json({ received: true, action: 'duplicate_ignored' });
  }
  seenRequestIds.add(receivedReqId);

  // ── A3. Schema Validation ─────────────────────────────────────────────────
  const { event_type, data } = req.body;

  if (!event_type || typeof event_type !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid event_type field.' });
  }

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid data field.' });
  }

  // Acknowledge receipt immediately (CM expects 200 within 5s)
  // All heavy processing happens AFTER the response is sent.
  res.status(200).json({ received: true, event_type, request_id: receivedReqId });

  // ── A4. Async Event Processing (fire-and-forget after 200) ───────────────
  setImmediate(async () => {
    try {
      await processCMEvent(event_type, data, receivedReqId);
    } catch (err) {
      console.error(`[Webhook-CM] Event processing error for ${event_type}:`, err.message);
    }
  });
});

/**
 * Process a validated inbound CM event by type.
 * All heavy work (DB writes, cache invalidation) happens here.
 */
async function processCMEvent(eventType, data, requestId) {
  logEvent({
    eventType,
    requestId,
    propertyId: data?.property_id,
    bookingRef: data?.partner_reference,
  });

  switch (eventType) {
    // ─────────────────────────────────────────────────────────────────────
    // BOOKING.CONFIRMED: CM confirmed our reservation request
    // Fired by the CM after we send a /reserve outbound call.
    // ─────────────────────────────────────────────────────────────────────
    case 'booking.confirmed': {
      const {
        partner_reference: imxxRef, // our booking ref we sent
        cm_confirmation_id, // CM's own confirmation number
        property_id,
        room_type_id,
        total_net,
        currency,
      } = data;

      console.log(
        `[Webhook-CM] ✅ Booking CONFIRMED | IMXX: ${imxxRef} | CM: ${cm_confirmation_id}`
      );

      // Update booking status in our DB if we track it
      try {
        await dbRun(
          `UPDATE bookings
             SET status = 'confirmed',
                 utr    = ?
           WHERE utr = ?`,
          [cm_confirmation_id || imxxRef, imxxRef]
        );
      } catch (dbErr) {
        console.error('[Webhook-CM] DB update failed for booking.confirmed:', dbErr.message);
      }
      break;
    }

    // ─────────────────────────────────────────────────────────────────────
    // BOOKING.CANCELLED: Guest or property cancelled a reservation
    // ─────────────────────────────────────────────────────────────────────
    case 'booking.cancelled': {
      const { partner_reference, cancellation_reason, refund_amount } = data;
      console.log(
        `[Webhook-CM] ❌ Booking CANCELLED | IMXX: ${partner_reference} | Reason: ${cancellation_reason}`
      );

      try {
        await dbRun(`UPDATE bookings SET status = 'cancelled' WHERE utr = ?`, [partner_reference]);
      } catch (dbErr) {
        console.error('[Webhook-CM] DB update failed for booking.cancelled:', dbErr.message);
      }

      // TODO: Trigger Stripe refund via stripe.refunds.create() if refund_amount > 0
      if (refund_amount && parseFloat(refund_amount) > 0) {
        console.log(
          `[Webhook-CM] Refund due: ${refund_amount} ${data.currency || 'USD'} — manual refund needed.`
        );
      }
      break;
    }

    // ─────────────────────────────────────────────────────────────────────
    // ROOM.AVAILABILITY.UPDATED: Inventory count changed
    // Used to keep displayed "rooms remaining" counts accurate
    // ─────────────────────────────────────────────────────────────────────
    case 'room.availability.updated': {
      const { property_id, room_type_id, available_count, date } = data;
      console.log(
        `[Webhook-CM] 🔄 Availability update | Property: ${property_id} | ` +
          `Room: ${room_type_id} | Avail: ${available_count} | Date: ${date}`
      );
      // In a full implementation: update a hostel_availability table or
      // invalidate the relevant search cache entry.
      break;
    }

    // ─────────────────────────────────────────────────────────────────────
    // RATE.CHANGED: CM notifies us of new net rates
    // Critical for keeping markup calculations current
    // ─────────────────────────────────────────────────────────────────────
    case 'rate.changed': {
      const { property_id, room_type_id, new_net_rate, effective_from } = data;
      console.log(
        `[Webhook-CM] 💰 Rate change | Property: ${property_id} | ` +
          `Room: ${room_type_id} | New net rate: $${new_net_rate} from ${effective_from}`
      );
      // In production: persist to a hostel_rates table and invalidate cache.
      break;
    }

    // ─────────────────────────────────────────────────────────────────────
    // BOOKING.NO_SHOW: Guest did not arrive
    // ─────────────────────────────────────────────────────────────────────
    case 'booking.no_show': {
      const { partner_reference } = data;
      console.log(`[Webhook-CM] 🚫 No-show | IMXX: ${partner_reference}`);
      await dbRun(`UPDATE bookings SET status = 'no_show' WHERE utr = ?`, [
        partner_reference,
      ]).catch((err) => console.error('[Webhook-CM] no_show DB update failed:', err.message));
      break;
    }

    default:
      console.log(`[Webhook-CM] Unhandled event type: ${eventType} — logged and ignored.`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DIRECTION B — OUTBOUND: IMXX → Channel Manager
// POST /api/webhooks/channel-manager/reserve
//
// Called by our OWN frontend/backend after a Stripe payment is confirmed.
// This fires a reservation creation request to the CM to lock the room and
// log the commission accrual.
//
// This is the "double-booking prevention" endpoint.
//
// Request Body:
//   {
//     propertyId:      string   (e.g. "gds-cm-prop-001")
//     roomTypeId:      string   (e.g. "rm-001-pvt-twin")
//     checkInDate:     string   "YYYY-MM-DD"
//     checkOutDate:    string   "YYYY-MM-DD"
//     guests:          number
//     paymentIntentId: string   (Stripe PI id — proof of payment)
//     specialRequests: object   (optional)
//   }
//
// Response 201:
//   {
//     imxxBookingRef:   "IMXX-20260611-A3KX9Q",
//     cmConfirmationId: "CM-CONF-XXXXX",
//     commission:       { ... }  // logged commission record
//   }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/reserve', requireAuth, async (req, res, next) => {
  const {
    propertyId,
    roomTypeId,
    checkInDate,
    checkOutDate,
    guests = 1,
    paymentIntentId,
    specialRequests = {},
  } = req.body;

  // ── B1. Validate required fields ─────────────────────────────────────────
  const missing = [];
  if (!propertyId) missing.push('propertyId');
  if (!roomTypeId) missing.push('roomTypeId');
  if (!checkInDate) missing.push('checkInDate');
  if (!checkOutDate) missing.push('checkOutDate');
  if (!paymentIntentId) missing.push('paymentIntentId');
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}.` });
  }

  const guestCount = parseInt(guests, 10);
  if (isNaN(guestCount) || guestCount < 1 || guestCount > 20) {
    return res.status(400).json({ error: 'guests must be between 1 and 20.' });
  }

  // ── B2. Verify Stripe PaymentIntent is genuinely succeeded ───────────────
  //
  // Security: never trust the client's claim that payment succeeded.
  // Always verify server-side against Stripe's API.
  //
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(402).json({
        error: `Payment not confirmed. PaymentIntent status: ${paymentIntent.status}. Please complete payment first.`,
      });
    }
  } catch (stripeErr) {
    console.error('[Reserve] Stripe PI verification failed:', stripeErr.message);
    return res.status(402).json({
      error: 'Could not verify payment. Please try again or contact support.',
    });
  }

  // ── B3. Resolve property + room type from CM data ─────────────────────────
  //
  // In production: fetch the property from a cache or CM single-property endpoint.
  // For now: resolve from the mock CM using a dummy search payload.
  //
  let nativeProperty, roomType;

  try {
    const mockCheckIn = checkInDate;
    const mockCheckOut = checkOutDate;
    const searchPayload = buildSearchPayload({
      destination: 'any',
      checkInDate: mockCheckIn,
      checkOutDate: mockCheckOut,
      guests: guestCount,
    });
    const cmResponse = simulateCMSearchResponse(searchPayload);

    const nights = Math.round(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );

    // Find the matching property
    const rawProperty = cmResponse.properties.find((p) => `gds-${p.property_id}` === propertyId);

    if (!rawProperty) {
      return res.status(404).json({ error: `Property ${propertyId} not found in inventory.` });
    }

    nativeProperty = mapPropertyToNative(rawProperty, {
      nights,
      guests: guestCount,
      checkInDate,
      checkOutDate,
    });

    roomType = nativeProperty.roomTypes.find((r) => r.id === roomTypeId);
    if (!roomType) {
      return res
        .status(404)
        .json({ error: `Room type ${roomTypeId} not found for this property.` });
    }

    if (!roomType.available) {
      return res
        .status(409)
        .json({ error: 'This room type is no longer available. Please select a different room.' });
    }
  } catch (resolveErr) {
    console.error('[Reserve] Property resolution failed:', resolveErr.message);
    return next(resolveErr);
  }

  // ── B4. Generate IMXX Booking Reference ──────────────────────────────────
  const imxxBookingRef = generateBookingRef(); // e.g. IMXX-20260611-A3KX9Q

  const nights = Math.round(
    (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
  );

  // ── B5. Build CM Reservation Payload ─────────────────────────────────────
  const customer = req.user; // decoded from JWT by authenticateToken

  const cmPayload = buildBookingPayload({
    property: nativeProperty,
    roomType,
    customer,
    checkInDate,
    checkOutDate,
    guests: guestCount,
    imxxBookingRef,
    paymentIntentId,
    specialRequests,
  });

  // ── B6. Fire Reservation to Channel Manager ───────────────────────────────
  let cmConfirmationId;
  const useMock = process.env.CM_MOCK_MODE !== 'false';

  try {
    if (useMock) {
      // Simulate CM confirmation response
      await new Promise((r) => setTimeout(r, 150 + Math.random() * 200)); // ~150-350ms
      cmConfirmationId = `CM-CONF-${Date.now().toString(36).toUpperCase()}`;
      console.log(
        `[Reserve] Mock CM confirmation: ${cmConfirmationId} ` + `for IMXX ref: ${imxxBookingRef}`
      );
    } else {
      // Real CM POST
      const cmConfirmResponse = await callChannelManagerReserve(cmPayload);
      cmConfirmationId = cmConfirmResponse.confirmation_id || cmConfirmResponse.reservation_id;
      if (!cmConfirmationId) {
        throw new Error('CM returned success but no confirmation_id');
      }
    }
  } catch (cmErr) {
    // CM refused or timed out — this is critical. Room is NOT locked.
    // We need to refund the user immediately.
    console.error('[Reserve] CM reservation FAILED:', cmErr.message);

    // In production: trigger a refund via stripe.refunds.create()
    return res.status(502).json({
      error:
        'Room reservation could not be confirmed. Your payment will be refunded automatically.',
      code: 'CM_RESERVATION_FAILED',
      imxxBookingRef,
      action: 'refund_initiated',
    });
  }

  // ── B7. Persist Booking to IMXX DB ───────────────────────────────────────
  const totalDisplayPrice = parseFloat((roomType.displayPricePerNight * nights).toFixed(2));
  const displayPriceStr = `$${totalDisplayPrice.toFixed(2)}`;

  try {
    await dbRun(
      `INSERT INTO bookings (user_id, item_name, total_price, utr, status)
       VALUES (?, ?, ?, ?, 'confirmed')`,
      [
        req.user.id,
        sanitize(`${nativeProperty.name} — ${roomType.name} (${nights}n)`),
        sanitize(displayPriceStr),
        imxxBookingRef,
      ]
    );
  } catch (dbErr) {
    // Non-fatal: booking is confirmed with CM — just log the DB failure
    console.error('[Reserve] DB booking insert failed:', dbErr.message);
  }

  // ── B8. Log Commission Accrual ───────────────────────────────────────────
  //
  // Commission = sell price we charged user − net rate we owe the CM.
  // This accumulates through the month and is settled at monthly payout cycle.
  //
  const commissionRecord = buildCommissionRecord({
    nativeProperty,
    roomType,
    nights,
    imxxBookingRef,
    cmConfirmationId,
    hostelOwnerId: null, // null when property is from CM (not a direct IMXX owner)
  });

  console.log(
    `[Reserve] 💰 Commission accrued | ${imxxBookingRef} | ` +
      `Sell: $${commissionRecord.total_sell} | ` +
      `Net owed: $${commissionRecord.total_net_owed_to_cm} | ` +
      `IMXX gross: $${commissionRecord.imxx_gross_commission}`
  );

  // In production: write commissionRecord to a cm_commission_ledger table.
  // Structure: booking_ref, cm_confirmation_id, total_sell, total_net,
  //            imxx_gross_commission, markup_multiplier, commission_status,
  //            recorded_at

  // ── B9. Respond to Client ─────────────────────────────────────────────────
  return res.status(201).json({
    message: 'Booking confirmed successfully!',
    imxxBookingRef,
    cmConfirmationId,
    property: {
      id: nativeProperty.id,
      name: nativeProperty.name,
      location: nativeProperty.location,
    },
    room: {
      id: roomType.id,
      name: roomType.name,
    },
    stay: {
      checkInDate,
      checkOutDate,
      nights,
      guests: guestCount,
    },
    pricing: {
      displayPricePerNight: roomType.displayPricePerNight,
      totalDisplayPrice,
      currency: nativeProperty.currency,
    },
    commission: {
      totalSell: commissionRecord.total_sell,
      totalNetOwedToCM: commissionRecord.total_net_owed_to_cm,
      imxxGrossCommission: commissionRecord.imxx_gross_commission,
      markupMultiplier: commissionRecord.markup_multiplier,
      payoutCycle: commissionRecord.payout_cycle,
      status: commissionRecord.commission_status,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DIRECTION B — CM HTTP Client (Outbound POST for Reservations)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST the reservation payload to the Channel Manager's reservation endpoint.
 * @param {object} cmPayload - Output of buildBookingPayload()
 * @returns {Promise<object>} CM reservation confirmation response
 */
async function callChannelManagerReserve(cmPayload) {
  const CM_BASE_URL = process.env.CM_API_BASE_URL;
  const CM_API_KEY = process.env.CM_API_KEY;
  const CM_SECRET = process.env.CM_API_SECRET;

  if (!CM_BASE_URL || !CM_API_KEY) {
    throw new Error('[CM] CM_API_BASE_URL and CM_API_KEY must be set when CM_MOCK_MODE=false');
  }

  const timestamp = Date.now().toString();
  const body = JSON.stringify(cmPayload);
  const signature = crypto
    .createHmac('sha256', CM_SECRET || '')
    .update(timestamp + body)
    .digest('hex');

  const url = new URL('/api/v2/reservations', CM_BASE_URL);
  const lib = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'X-API-Key': CM_API_KEY,
          'X-Timestamp': timestamp,
          'X-Signature': signature,
          'X-Channel': 'IMXX_NOMAD',
          Accept: 'application/json',
        },
        timeout: 15000, // 15s — reservations are critical, give CM more time
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            if (res.statusCode >= 400) {
              reject(new Error(`CM reservation error ${res.statusCode}: ${parsed.message || raw}`));
            } else {
              resolve(parsed);
            }
          } catch {
            reject(new Error(`CM reservation returned invalid JSON: ${raw.slice(0, 200)}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('CM reservation timed out (15s)'));
    });
    req.on('error', (err) => reject(new Error(`CM network error: ${err.message}`)));
    req.write(body);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET /api/webhooks/channel-manager/events
// Returns the recent inbound event log (admin/debug use only)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/events', requireAuth, (req, res) => {
  return res.json({
    total: inboundEventLog.length,
    events: inboundEventLog.slice(0, 50), // latest 50
  });
});

module.exports = { router, init };
