const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { dbGet, dbRun, dbAll } = require('../config/database');
const { authenticateToken, authenticateOptional } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { createPaymentIntent } = require('../controllers/paymentController');
const { calculateSplitPayment, buildLedgerEntry } = require('../controllers/paymentSplitter');
const {
  createBooking,
  createDirectTransferBooking,
  getUserBookings,
  getBookingById,
  updateGuestInfo,
  uploadScreenshot,
  getBookingStatus,
} = require('../controllers/bookingController');
const rateLimit = require('express-rate-limit');

// Dedicated limiter for webhook


//  BOOKINGS & PAYMENTS ROUTES
// ─────────────────────────────────────────────

// ─── Payment Intent (server-side price — no client price accepted) ────────────
// Uses Zod-validated schema: expects destinationId + dates, NOT a price.
router.post(
  '/create-payment-intent',
  authenticateToken,
  validate(schemas.createPaymentIntent),
  createPaymentIntent
);

// ─── Booking CRUD (modular controller) ───────────────────────────────────────
router.post('/', authenticateToken, validate(schemas.createBooking), createBooking);
router.post('/direct-transfer', authenticateOptional, createDirectTransferBooking);
router.get('/', authenticateToken, getUserBookings);
router.get('/:id', authenticateToken, getBookingById);
router.patch(
  '/:id/guest-info',
  authenticateToken,
  validate(schemas.guestInfo),
  updateGuestInfo
);
router.post('/:id/upload-screenshot', authenticateOptional, uploadScreenshot);
router.get('/:id/status', authenticateOptional, getBookingStatus);

// ─── Auto-Confirm after 5-min timer (no auth required) ───────────────────────
router.put('/:id/auto-confirm', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.status !== 'AWAITING_CONFIRMATION') {
      return res.json({
        success: true,
        message: 'Booking already processed.',
        status: booking.status,
      });
    }
    await dbRun(`UPDATE bookings SET status = 'SUCCESS' WHERE id = ?`, [bookingId]);
    console.log(`[Auto-Confirm] Booking #${bookingId} auto-confirmed after 5-minute timer.`);
    res.json({ success: true, message: 'Payment auto-confirmed successfully.' });
  } catch (err) {
    console.error('[Auto-Confirm Error]', err);
    res.status(500).json({ error: 'Auto-confirm failed.' });
  }
});

// ─── WhatsApp Confirmation Action (GET request triggered by clicking link in WhatsApp) ───
router.get('/:id/whatsapp-confirm', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { status } = req.query; // 'YES' or 'NO'
    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) {
      return res.send(`
        <div style="font-family:sans-serif; text-align:center; padding:50px; background:#111; color:#fff; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center;">
          <h1 style="color:#ef4444;">Booking Not Found</h1>
          <p>We could not find booking ref #${bookingId}.</p>
        </div>
      `);
    }

    let finalStatus = 'SUCCESS';
    let title = 'Booking Confirmed! 🎉';
    let message = `Booking #${bookingId} has been successfully approved and confirmed.`;
    let color = '#10b981';

    if (status === 'NO') {
      finalStatus = 'REJECTED';
      title = 'Booking Rejected ❌';
      message = `Booking #${bookingId} has been rejected.`;
      color = '#ef4444';
    }

    await dbRun(`UPDATE bookings SET status = ? WHERE id = ?`, [finalStatus, bookingId]);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>IMXX Booking Action</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #0a0a0a;
            color: #fff;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          .card {
            background: #121212;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          h1 {
            color: ${color};
            margin-top: 0;
            font-size: 24px;
          }
          p {
            color: #aaa;
            font-size: 14px;
            line-height: 1.6;
          }
          .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 24px;
            background: ${color};
            color: #000;
            text-decoration: none;
            font-weight: bold;
            border-radius: 30px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${title}</h1>
          <p>${message}</p>
          <a href="/" class="btn">Go to Site</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('[WhatsApp Confirm Error]', err);
    res.status(500).send('An error occurred.');
  }
});



// ─────────────────────────────────────────────────────────────────────────────
//  HOSTEL MARKETPLACE — Checkout Success Webhook
//  POST /checkout-success
// ─────────────────────────────────────────────────────────────────────────────
//
//  This endpoint acts as the Stripe webhook receiver for the event:
//  'payment_intent.succeeded'  (or 'checkout.session.completed' in full Stripe
//   Checkout flow).
//
//  Production flow:
//    1. Stripe signs every webhook POST with a HMAC-SHA256 header
//       (Stripe-Signature). We verify it using stripe.webhooks.constructEvent()
//       before touching any data. Invalid signatures are immediately rejected.
//
//    2. We look up the hostel listing and its owner from the metadata embedded
//       in the PaymentIntent at creation time.
//
//    3. We call calculateSplitPayment() to get the precise commission and
//       vendor payout amounts (integer-cent arithmetic, no float drift).
//
//    4. We create a Stripe Transfer to the owner's Connected Account. This moves
//       money from the IMXX platform Stripe balance to the vendor's balance.
//       Stripe then initiates an automatic payout to the vendor's linked bank.
//
//    5. Every split is recorded in hostel_payout_ledger as an audit trail.
//
//  To register this endpoint in Stripe Dashboard:
//    Dashboard → Developers → Webhooks → Add endpoint
//    URL: https://yourdomain.com/checkout-success
//    Events: payment_intent.succeeded
//
//  Local testing (Stripe CLI):
//    stripe listen --forward-to localhost:5000/checkout-success
//    stripe trigger payment_intent.succeeded
// ─────────────────────────────────────────────────────────────────────────────

const WEBHOOK_RATE_LIMIT = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many webhook calls.' },
});

router.post('/checkout-success', WEBHOOK_RATE_LIMIT, async (req, res) => {
  // ── 1. Stripe Signature Verification ─────────────────────────────────────
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  if (webhookSecret && sig) {
    // Production path: cryptographically verify the webhook origin
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        req.body, // raw Buffer (captured before express.json parsed it)
        sig,
        webhookSecret
      );
    } catch (sigErr) {
      console.warn('[Webhook] Signature verification failed:', sigErr.message);
      return res
        .status(400)
        .json({ error: `Webhook signature verification failed: ${sigErr.message}` });
    }
  } else {
    // Development / simulation path: accept JSON body without signature check.
    // This path MUST NOT be reachable in production — gate it with STRIPE_WEBHOOK_SECRET.
    console.warn(
      '[Webhook] ⚠️  STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev mode only).'
    );
    try {
      // req.body is a Buffer when raw middleware is active; parse it manually
      const payload = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString('utf8')) : req.body;
      stripeEvent = payload;
    } catch (parseErr) {
      return res.status(400).json({ error: 'Invalid JSON payload.' });
    }
  }

  // ── 2. Filter: only process payment_intent.succeeded events ──────────────
  const eventType = stripeEvent?.type;
  if (eventType !== 'payment_intent.succeeded') {
    // Acknowledge other event types silently (Stripe requires a 2xx)
    console.log(`[Webhook] Ignoring event type: ${eventType}`);
    return res.status(200).json({ received: true, action: 'ignored' });
  }

  const paymentIntent = stripeEvent.data?.object;

  if (!paymentIntent) {
    return res.status(400).json({ error: 'Malformed event: missing data.object.' });
  }

  // ── 3. Extract metadata injected at PaymentIntent creation time ──────────
  //
  //  In the create-payment-intent route, when a hostel booking is being paid,
  //  the frontend must pass:
  //    metadata: { hostelListingId: '...', bookingId: '...' }
  //  when creating the PaymentIntent. This is how we know WHICH hostel was booked.
  //
  const { hostelListingId, bookingId } = paymentIntent.metadata || {};

  if (!hostelListingId || !bookingId) {
    // This PaymentIntent wasn't for a hostel booking — skip payout logic.
    console.log(
      '[Webhook] PaymentIntent has no hostelListingId/bookingId metadata — not a hostel booking. Skipping payout.'
    );
    return res.status(200).json({ received: true, action: 'skipped_non_hostel' });
  }

  try {
    // ── 4. Fetch the hostel listing and its owner's account details ─────────
    const listing = await dbGet(
      `SELECT hl.id, hl.hostel_name, hl.price_per_night, hl.hostel_owner_id,
                ho.business_name, ho.stripe_connect_account_id,
                ho.commission_rate, ho.is_verified, ho.contact_email
         FROM hostel_listings hl
         INNER JOIN hostel_owners ho ON ho.id = hl.hostel_owner_id
         WHERE hl.id = ? AND hl.is_active = 1`,
      [parseInt(hostelListingId, 10)]
    );

    if (!listing) {
      console.error(`[Webhook] Hostel listing #${hostelListingId} not found or inactive.`);
      // Return 200 to acknowledge receipt so Stripe doesn't retry indefinitely.
      // The error is logged for manual investigation.
      return res.status(200).json({
        received: true,
        action: 'error_listing_not_found',
        detail: `Listing #${hostelListingId} not found.`,
      });
    }

    if (!listing.is_verified) {
      console.warn(`[Webhook] Owner ${listing.hostel_owner_id} is NOT verified. Payout held.`);
      // Record in ledger as 'pending' — a manual review step will release the funds.
      const split = calculateSplitPayment(
        paymentIntent.amount / 100, // Stripe stores amounts in cents
        listing.commission_rate
      );
      await dbRun(
        `INSERT INTO hostel_payout_ledger
             (booking_id, hostel_owner_id, hostel_listing_id, booking_total,
              commission_rate, commission_amount, vendor_payout_amount,
              payout_status, payout_reference)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'held_unverified', ?)`,
        [
          parseInt(bookingId, 10),
          listing.hostel_owner_id,
          listing.id,
          split.bookingTotal,
          split.commissionRate,
          split.platformCommission,
          split.vendorPayout,
          paymentIntent.id,
        ]
      );
      return res.status(200).json({ received: true, action: 'held_unverified_vendor' });
    }

    // ── 5. Calculate the commission split ────────────────────────────────────
    //
    //  bookingTotal comes from Stripe (amount field is in cents → divide by 100).
    //  commission_rate comes from the hostel_owners row — dynamically configurable
    //  per partner without changing any code.
    //
    const bookingTotalUSD = paymentIntent.amount / 100;
    const split = calculateSplitPayment(bookingTotalUSD, listing.commission_rate);

    console.log(
      `[Webhook] Split for booking #${bookingId} | ` +
        `Total: $${split.bookingTotal} | ` +
        `Commission (${split.platformCommissionPct}): $${split.platformCommission} | ` +
        `Vendor Payout: $${split.vendorPayout}`
    );

    // ── 6. Issue Stripe Transfer to Vendor's Connected Account ───────────────
    //
    //  stripe.transfers.create() moves funds from the IMXX platform's Stripe
    //  balance (from which the original charge was collected) to the vendor's
    //  Stripe Connect account balance.
    //
    //  The vendor_payout_amount is converted back to cents for Stripe.
    //  Stripe then automatically pays out to the vendor's linked bank account
    //  on their configured payout schedule (daily/weekly/monthly).
    //
    let stripeTransferId = null;
    let payoutStatus = 'processing';

    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(split.vendorPayout * 100), // back to cents
        currency: paymentIntent.currency || 'usd',
        destination: listing.stripe_connect_account_id,
        transfer_group: `BOOKING_${bookingId}`,
        source_transaction: paymentIntent.latest_charge, // idempotency tie
        metadata: {
          booking_id: bookingId,
          hostel_listing_id: hostelListingId,
          hostel_owner_id: String(listing.hostel_owner_id),
          platform_commission: String(split.platformCommission),
          vendor_payout: String(split.vendorPayout),
          imxx_platform: 'IMXX_NOMAD',
        },
      });

      stripeTransferId = transfer.id;
      payoutStatus = 'transferred';

      console.log(
        `[Webhook] ✅ Stripe Transfer ${transfer.id} created | ` +
          `$${split.vendorPayout} → ${listing.stripe_connect_account_id} ` +
          `(${listing.business_name})`
      );
    } catch (transferErr) {
      // Transfer failed (e.g. insufficient balance, account restricted).
      // Record as 'failed' in ledger — do NOT retry automatically.
      // Alert your operations team via Sentry / PagerDuty here.
      payoutStatus = 'failed';
      console.error(
        `[Webhook] ❌ Stripe Transfer FAILED for booking #${bookingId}:`,
        transferErr.message
      );
    }

    // ── 7. Write to hostel_payout_ledger (audit trail) ─────────────────────
    //
    //  This record is the source of truth for:
    //    - Partner dashboard KPI aggregations
    //    - Finance reconciliation
    //    - Dispute resolution
    //  It is written regardless of transfer success/failure.
    //
    await dbRun(
      `INSERT INTO hostel_payout_ledger
           (booking_id, hostel_owner_id, hostel_listing_id, booking_total,
            commission_rate, commission_amount, vendor_payout_amount,
            payout_status, payout_reference, stripe_transfer_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(bookingId, 10),
        listing.hostel_owner_id,
        listing.id,
        split.bookingTotal,
        split.commissionRate,
        split.platformCommission,
        split.vendorPayout,
        payoutStatus,
        paymentIntent.id,
        stripeTransferId,
      ]
    );

    // Respond 200 immediately — Stripe considers anything else a failure
    return res.status(200).json({
      received: true,
      action: 'payout_processed',
      bookingId,
      platformCommission: split.platformCommission,
      vendorPayout: split.vendorPayout,
      stripeTransferId,
      payoutStatus,
    });
  } catch (err) {
    console.error('[Webhook] Unhandled error during payout processing:', err);
    // Return 500 so Stripe retries the event (up to 25 times over 3 days)
    return res.status(500).json({ error: 'Internal payout processing error.' });
  }
});

module.exports = router;
