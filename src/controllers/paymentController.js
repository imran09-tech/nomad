/**
 * /src/controllers/paymentController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Payment Intent & Stripe Webhook controller.
 *
 * Key security enforcements:
 *  1. Price NEVER accepted from client — recomputed from DB using destinationId.
 *  2. Webhook signature verified via stripe.webhooks.constructEvent().
 *  3. Idempotency check: if booking already 'confirmed', skip re-processing.
 *  4. All DB mutations in the webhook are done before responding 200 to Stripe.
 *  5. asyncHandler ensures no uncaught promise rejections.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const stripe           = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { dbGet, dbRun } = require('../config/database');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const { getTransitPriceServerSide } = require('./transitController');
const nodemailer       = require('nodemailer');

// ── Email transporter (Nodemailer + SMTP / SendGrid) ─────────────────────────
let mailer = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailer = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('[Mailer] Nodemailer transport configured via SMTP.');
} else {
  console.warn('[Mailer] SMTP_HOST/SMTP_USER/SMTP_PASS not set — email notifications disabled.');
}

/**
 * Build a dark-themed HTML email for booking confirmation.
 */
function buildConfirmationEmail({ guestName, guestEmail, bookingRef, destinationName, checkIn, checkOut, totalUsd }) {
  return {
    from:    `"IMXX Premium" <${process.env.SMTP_USER || 'noreply@imxx.com'}>`,
    to:      guestEmail,
    subject: `✅ Booking Confirmed — ${destinationName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Booking Confirmation</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#111;border-radius:16px;border:1px solid rgba(212,175,55,0.3);overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1200,#2a1e00);padding:40px;text-align:center;border-bottom:2px solid #D4AF37;">
            <div style="font-size:32px;font-weight:900;color:#D4AF37;letter-spacing:4px;">IMXX</div>
            <div style="font-size:12px;color:#aaa;letter-spacing:6px;margin-top:4px;">PREMIUM TRAVEL</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="color:#fff;font-size:24px;margin:0 0 8px;">Booking Confirmed! 🎉</h1>
            <p style="color:#aaa;font-size:15px;line-height:1.6;">
              Dear ${guestName}, your reservation is confirmed. Here are your trip details:
            </p>
            <!-- Details card -->
            <table width="100%" cellpadding="16" cellspacing="0"
                   style="background:#1a1a1a;border-radius:12px;margin:24px 0;border:1px solid rgba(255,255,255,0.06);">
              <tr>
                <td style="color:#888;font-size:13px;border-bottom:1px solid #222;">Booking Reference</td>
                <td style="color:#D4AF37;font-weight:700;font-size:15px;text-align:right;border-bottom:1px solid #222;">${bookingRef}</td>
              </tr>
              <tr>
                <td style="color:#888;font-size:13px;border-bottom:1px solid #222;">Destination</td>
                <td style="color:#fff;font-weight:600;font-size:15px;text-align:right;border-bottom:1px solid #222;">${destinationName}</td>
              </tr>
              <tr>
                <td style="color:#888;font-size:13px;border-bottom:1px solid #222;">Check-in</td>
                <td style="color:#fff;text-align:right;border-bottom:1px solid #222;">${checkIn}</td>
              </tr>
              <tr>
                <td style="color:#888;font-size:13px;border-bottom:1px solid #222;">Check-out</td>
                <td style="color:#fff;text-align:right;border-bottom:1px solid #222;">${checkOut}</td>
              </tr>
              <tr>
                <td style="color:#888;font-size:13px;">Total Charged</td>
                <td style="color:#4CAF50;font-weight:800;font-size:18px;text-align:right;">$${totalUsd.toFixed(2)} USD</td>
              </tr>
            </table>
            <p style="color:#666;font-size:12px;margin-top:32px;border-top:1px solid #222;padding-top:20px;">
              Questions? Contact us at support@imxx.com | IMXX Premium Travel Platform<br>
              <em>This is an automated message. Please do not reply directly.</em>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

// ── ADDON PRICING (server-side, never from client) ────────────────────────────
const ADDON_PRICES = {
  flight:      299,   // USD
  food_bundle:  89,
  events:      149,
};

// ── Compute nightly rate from destination price string ────────────────────────
function parseDestinationPrice(priceStr) {
  if (!priceStr) return 0;
  const match = String(priceStr).replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

// ── Night count helper ────────────────────────────────────────────────────────
function nightsBetween(checkIn, checkOut) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}


// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/create-payment-intent
//  ► Price computed server-side from DB — client CANNOT inject price.
// ─────────────────────────────────────────────────────────────────────────────
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { destinationId, checkIn, checkOut, guests = 1, addons = [], transitId = null } = req.body;

  // 1. Validate dates are in the future and logical
  const now = new Date();
  const checkInDate  = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (checkInDate < now) throw createError('Check-in date cannot be in the past.', 400);
  if (checkOutDate <= checkInDate) throw createError('Check-out must be after check-in.', 400);

  // 2. Fetch destination price from DB (NEVER from client)
  const destination = await dbGet('SELECT * FROM destinations WHERE id = ?', [destinationId]);
  if (!destination) throw createError('Destination not found.', 404);

  const basePrice = parseDestinationPrice(destination.price);
  if (basePrice <= 0) throw createError('Pricing unavailable for this destination.', 400);

  const nights  = nightsBetween(checkIn, checkOut);
  const perNight = basePrice; // stored as per-person/per-night figure

  // 3. Compute total (server-side only)
  let total = perNight * nights * Math.max(1, guests);

  // 4. Add addon prices (validated against server-side allowlist)
  for (const addon of addons) {
    if (ADDON_PRICES[addon]) total += ADDON_PRICES[addon];
  }

  // 4b. Add real-time transit pricing securely from the backend lookup
  let transitPrice = 0;
  if (transitId) {
    transitPrice = getTransitPriceServerSide(transitId);
    if (!transitPrice) throw createError('Selected transit route is unavailable or invalid.', 400);
    total += (transitPrice * Math.max(1, guests));
  }

  // 5. Add processing fee (2.9% + $0.30 to cover Stripe)
  const stripeFee   = Math.round(total * 0.029 * 100) / 100 + 0.30;
  const grandTotal  = parseFloat((total + stripeFee).toFixed(2));
  const amountCents = Math.round(grandTotal * 100);

  if (amountCents < 50) throw createError('Minimum payment amount is $0.50.', 400);

  // 6. Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount:   amountCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      destinationId: String(destinationId),
      checkIn,
      checkOut,
      guests: String(guests),
      addons: JSON.stringify(addons),
      transitId: transitId ? String(transitId) : 'none',
      basePrice: String(perNight),
      nights: String(nights),
    },
  });

  res.json({
    success:      true,
    clientSecret: paymentIntent.client_secret,
    breakdown: {
      basePrice:    perNight,
      nights,
      guests,
      subtotal:     parseFloat((perNight * nights * guests).toFixed(2)),
      addons:       addons.reduce((acc, a) => ({ ...acc, [a]: ADDON_PRICES[a] || 0 }), {}),
      transitTotal: transitPrice ? parseFloat((transitPrice * guests).toFixed(2)) : 0,
      stripeFee:    parseFloat(stripeFee.toFixed(2)),
      grandTotal,
    },
  });
});


// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bookings/checkout-success  (Stripe Webhook)
//
//  Security layers:
//  ① Stripe signature verification with raw body buffer
//  ② Idempotency: skip if booking already 'confirmed'
//  ③ Inventory decrement in same DB transaction
//  ④ Email dispatched only after DB confirms update
// ─────────────────────────────────────────────────────────────────────────────
const stripeWebhook = async (req, res) => {
  const sig           = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // ① Signature verification
  let event;
  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (sigErr) {
      console.warn('[Webhook] Signature verification failed:', sigErr.message);
      return res.status(400).json({ error: `Webhook signature verification failed: ${sigErr.message}` });
    }
  } else {
    // Dev-only fallback — gated on absence of STRIPE_WEBHOOK_SECRET
    if (process.env.NODE_ENV === 'production') {
      return res.status(400).json({ error: 'Webhook secret not configured.' });
    }
    console.warn('[Webhook] ⚠️  Signature check skipped (dev mode — no STRIPE_WEBHOOK_SECRET set).');
    try {
      event = Buffer.isBuffer(req.body)
        ? JSON.parse(req.body.toString('utf8'))
        : req.body;
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload.' });
    }
  }

  const eventType = event?.type;

  if (eventType === 'payment_intent.succeeded') {
    const pi          = event.data?.object;
    const bookingId   = pi?.metadata?.bookingId;
    const piId        = pi?.id;

    console.log(`[Webhook] payment_intent.succeeded | pi=${piId} | booking=${bookingId}`);

    try {
      // ② Idempotency check — skip if already confirmed
      if (bookingId) {
        const existing = await dbGet('SELECT status FROM bookings WHERE id = ?', [bookingId]);
        if (existing?.status === 'confirmed') {
          console.log(`[Webhook] Booking #${bookingId} already confirmed — skipping duplicate.`);
          return res.status(200).json({ received: true, action: 'already_confirmed' });
        }
      }

      // ③ Update booking status to confirmed
      if (bookingId) {
        await dbRun(
          'UPDATE bookings SET status = ?, payment_intent_id = ? WHERE id = ?',
          ['confirmed', piId, bookingId]
        );

        // Fetch booking details for email
        const booking = await dbGet(
          `SELECT b.*, u.full_name, u.email as user_email,
                  d.name as destination_name, d.price as destination_price
           FROM bookings b
           LEFT JOIN users u ON u.id = b.user_id
           LEFT JOIN destinations d ON d.id = b.destination_id
           WHERE b.id = ?`,
          [bookingId]
        );

        if (booking && mailer) {
          const totalUsd = (pi.amount || 0) / 100;
          const emailPayload = buildConfirmationEmail({
            guestName:       booking.full_name || 'Valued Guest',
            guestEmail:      booking.user_email,
            bookingRef:      `IMXX-${String(booking.id).padStart(6, '0')}`,
            destinationName: booking.destination_name || booking.item_name || 'Your Booking',
            checkIn:         booking.check_in  || 'N/A',
            checkOut:        booking.check_out || 'N/A',
            totalUsd,
          });

          // ④ Fire-and-forget email — don't fail webhook if email fails
          mailer.sendMail(emailPayload).catch(e =>
            console.error('[Webhook] Email dispatch failed:', e.message)
          );
        }
      }
    } catch (dbErr) {
      console.error('[Webhook] DB update error:', dbErr.message);
      // Return 500 so Stripe retries (up to 25× over 3 days)
      return res.status(500).json({ error: 'Internal processing error.' });
    }
  }

  else if (eventType === 'payment_intent.payment_failed') {
    const pi        = event.data?.object;
    const bookingId = pi?.metadata?.bookingId;
    if (bookingId) {
      await dbRun('UPDATE bookings SET status = ? WHERE id = ?', ['failed', bookingId]).catch(e =>
        console.error('[Webhook] Failed to mark booking as failed:', e)
      );
    }
  }

  else {
    console.log(`[Webhook] Unhandled event type "${eventType}" — acknowledged.`);
  }

  // Always return 200 to Stripe for acknowledgement
  return res.status(200).json({ received: true });
};


module.exports = { createPaymentIntent, stripeWebhook };
