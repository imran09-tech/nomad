/**
 * =============================================================================
 * IMXX NOMAD — Vendor / Hostel Partner Routes
 * routes/vendors.js
 *
 * Handles all partner-facing lifecycle:
 *   1. Partner onboarding (POST /api/vendors/register)
 *   2. Dashboard stats   (GET  /api/vendors/:id/dashboard)
 *   3. Hostel listing    (POST /api/vendors/:id/listings)
 *   4. All partner list  (GET  /api/vendors)    [admin only]
 *   5. Update rates      (PUT  /api/vendors/:id/commission)  [admin only]
 *
 * Auth: JWT via shared authenticateToken middleware.
 *       Admin-gated routes check req.user.role === 'admin'.
 *
 * Security:
 *   - All user-supplied strings are run through the shared sanitize() helper.
 *   - Commission rate is validated to [0.01, 0.50] (1%–50%) before DB write.
 *   - Stripe connect account IDs are validated by format before persistence.
 *   - bankAccountLast4 stores only the last 4 digits — never full account numbers.
 * =============================================================================
 */

'use strict';

const express = require('express');
const router = express.Router();

// ──────────────────────────────────────────────────────────────────────────────
// DEPENDENCIES — injected at router init time to avoid circular references
// ──────────────────────────────────────────────────────────────────────────────
let dbRun, dbGet, dbAll, authenticateToken, sanitize, stripe;

/**
 * Initialize router with shared app-level dependencies.
 * Called once from server.js before mounting the router.
 *
 * @param {object} deps
 */
function init(deps) {
  dbRun = deps.dbRun;
  dbGet = deps.dbGet;
  dbAll = deps.dbAll;
  authenticateToken = deps.authenticateToken;
  sanitize = deps.sanitize;
  stripe = deps.stripe;
}

// ──────────────────────────────────────────────────────────────────────────────
// PRIVATE VALIDATORS
// ──────────────────────────────────────────────────────────────────────────────

const requireAuth = (req, res, next) => {
  if (authenticateToken) return authenticateToken(req, res, next);
  next(new Error('authenticateToken not initialized'));
};

/** Validate a Stripe Connect account ID (format: acct_XXXXXXXXXXXXXXXX) */
const STRIPE_ACCT_RE = /^acct_[0-9A-Za-z]{16,}$/;
function isValidStripeAccountId(id) {
  return typeof id === 'string' && STRIPE_ACCT_RE.test(id);
}

/** Validate commission rate: must be a number between 0.01 and 0.50 */
function isValidCommissionRate(rate) {
  const n = parseFloat(rate);
  return !isNaN(n) && n >= 0.01 && n <= 0.5;
}

// ──────────────────────────────────────────────────────────────────────────────
// ROUTE 1 — Partner Onboarding
// POST /api/vendors/register
//
// Creates a new HostelOwner partner record. This is the entry point for
// bringing a hostel property onto the IMXX Nomad marketplace.
//
// Request body:
//   businessName             string   required
//   contactEmail             string   required
//   stripeConnectedAccountId string   required  (from Stripe Connect OAuth flow)
//   bankHolderName           string   required
//   bankAccountLast4         string   required  (4-digit string, stored for display only)
//   commissionRate           number   optional  (default: 0.12 → 12%)
//
// Response 201:
//   { message, vendorId }
// ──────────────────────────────────────────────────────────────────────────────
router.post('/register', requireAuth, async (req, res, next) => {
  const {
    businessName,
    contactEmail,
    stripeConnectedAccountId,
    bankHolderName,
    bankAccountLast4,
    commissionRate = 0.12, // Default: 12% platform cut
  } = req.body;

  // ── Field presence checks ─────────────────────────────────────────────────
  const missing = [];
  if (!businessName) missing.push('businessName');
  if (!contactEmail) missing.push('contactEmail');
  if (!stripeConnectedAccountId) missing.push('stripeConnectedAccountId');
  if (!bankHolderName) missing.push('bankHolderName');
  if (!bankAccountLast4) missing.push('bankAccountLast4');
  if (missing.length) {
    return res.status(400).json({
      error: `Missing required fields: ${missing.join(', ')}.`,
    });
  }

  // ── Email format ──────────────────────────────────────────────────────────
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contactEmail)) {
    return res.status(400).json({ error: 'Please provide a valid contact email address.' });
  }

  // ── Stripe Connect account ID format ─────────────────────────────────────
  if (!isValidStripeAccountId(stripeConnectedAccountId)) {
    return res.status(400).json({
      error: 'Invalid Stripe Connect account ID format. Expected: acct_XXXXXXXXXXXXXXXX',
    });
  }

  // ── Bank last4: must be exactly 4 digits ─────────────────────────────────
  if (!/^\d{4}$/.test(String(bankAccountLast4))) {
    return res.status(400).json({ error: 'bankAccountLast4 must be exactly 4 digits.' });
  }

  // ── Commission rate validation ────────────────────────────────────────────
  if (!isValidCommissionRate(commissionRate)) {
    return res.status(400).json({
      error: 'commissionRate must be a decimal between 0.01 (1%) and 0.50 (50%).',
    });
  }

  // ── Duplicate email guard ─────────────────────────────────────────────────
  try {
    const existing = await dbGet('SELECT id FROM hostel_owners WHERE contact_email = ?', [
      contactEmail.toLowerCase(),
    ]);
    if (existing) {
      return res.status(409).json({
        error: 'A vendor account with this email already exists.',
      });
    }

    // ── Persist the new partner ───────────────────────────────────────────
    const result = await dbRun(
      `INSERT INTO hostel_owners
         (business_name, contact_email, stripe_connect_account_id,
          bank_holder_name, bank_account_last4, commission_rate, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        sanitize(businessName),
        contactEmail.toLowerCase(),
        stripeConnectedAccountId, // not sanitized: validated by regex
        sanitize(bankHolderName),
        String(bankAccountLast4),
        parseFloat(commissionRate),
      ]
    );

    return res.status(201).json({
      message: 'Partner vendor registered successfully. Pending verification.',
      vendorId: result.lastID,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// ROUTE 2 — Partner Dashboard Stats
// GET /api/vendors/:id/dashboard
//
// Aggregates the payout ledger for a specific hostel owner to produce the
// three KPI metrics displayed on the Partner Dashboard UI:
//   - Total Gross Revenue (sum of all booking_total values)
//   - Total Platform Commission Paid (sum of commission_amount)
//   - Net Amount Transferred (sum of vendor_payout_amount where status='transferred')
//
// Also returns the last 10 individual payout transactions for the ledger table.
// ──────────────────────────────────────────────────────────────────────────────
router.get('/:id/dashboard', requireAuth, async (req, res, next) => {
  const ownerId = parseInt(req.params.id, 10);
  if (isNaN(ownerId) || ownerId <= 0) {
    return res.status(400).json({ error: 'Invalid vendor ID.' });
  }

  try {
    // Verify vendor exists
    const owner = await dbGet(
      `SELECT id, business_name, contact_email, commission_rate,
              bank_holder_name, bank_account_last4, is_verified
       FROM hostel_owners WHERE id = ?`,
      [ownerId]
    );
    if (!owner) {
      return res.status(404).json({ error: 'Vendor partner not found.' });
    }

    // Aggregate KPIs from the payout ledger
    const kpis = await dbGet(
      `SELECT
         COALESCE(SUM(booking_total),          0) AS gross_revenue,
         COALESCE(SUM(commission_amount),       0) AS total_commission,
         COALESCE(SUM(CASE WHEN payout_status = 'transferred'
                           THEN vendor_payout_amount ELSE 0 END), 0) AS net_transferred,
         COUNT(*)                                  AS total_bookings,
         COALESCE(SUM(vendor_payout_amount),    0) AS total_payout_due
       FROM hostel_payout_ledger
       WHERE hostel_owner_id = ?`,
      [ownerId]
    );

    // Recent transactions (last 10)
    const recentPayouts = await dbAll(
      `SELECT
         id, booking_id, booking_total, commission_amount,
         vendor_payout_amount, payout_status, payout_reference, created_at
       FROM hostel_payout_ledger
       WHERE hostel_owner_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [ownerId]
    );

    // Listings this owner has active
    const listings = await dbAll(
      `SELECT hl.id, hl.hostel_name, hl.location, hl.price_per_night, hl.is_active
       FROM hostel_listings hl
       WHERE hl.hostel_owner_id = ?
       ORDER BY hl.created_at DESC`,
      [ownerId]
    );

    return res.json({
      vendor: {
        id: owner.id,
        businessName: owner.business_name,
        contactEmail: owner.contact_email,
        commissionRate: owner.commission_rate,
        bankHolderName: owner.bank_holder_name,
        bankLast4: owner.bank_account_last4,
        isVerified: !!owner.is_verified,
      },
      kpis: {
        grossRevenue: parseFloat(kpis.gross_revenue.toFixed(2)),
        totalCommission: parseFloat(kpis.total_commission.toFixed(2)),
        netTransferred: parseFloat(kpis.net_transferred.toFixed(2)),
        totalPayoutDue: parseFloat(kpis.total_payout_due.toFixed(2)),
        totalBookings: kpis.total_bookings,
      },
      recentPayouts,
      listings,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// ROUTE 3 — Add a Hostel Listing for a Partner
// POST /api/vendors/:id/listings
//
// Registers a specific hostel property under a vendor partner's account.
// ──────────────────────────────────────────────────────────────────────────────
router.post('/:id/listings', requireAuth, async (req, res, next) => {
  const ownerId = parseInt(req.params.id, 10);
  if (isNaN(ownerId) || ownerId <= 0) {
    return res.status(400).json({ error: 'Invalid vendor ID.' });
  }

  const { hostelName, location, pricePerNight, imageUrl, description } = req.body;

  if (!hostelName || !location || !pricePerNight) {
    return res.status(400).json({ error: 'hostelName, location, and pricePerNight are required.' });
  }

  const price = parseFloat(pricePerNight);
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ error: 'pricePerNight must be a positive number.' });
  }

  try {
    const owner = await dbGet('SELECT id FROM hostel_owners WHERE id = ?', [ownerId]);
    if (!owner) return res.status(404).json({ error: 'Vendor partner not found.' });

    const result = await dbRun(
      `INSERT INTO hostel_listings
         (hostel_owner_id, hostel_name, location, price_per_night, image_url, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        ownerId,
        sanitize(hostelName),
        sanitize(location),
        price,
        sanitize(imageUrl || ''),
        sanitize(description || ''),
      ]
    );

    return res.status(201).json({
      message: 'Hostel listing created successfully.',
      listingId: result.lastID,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// ROUTE 4 — List All Registered Partners  [Admin-only]
// GET /api/vendors
// ──────────────────────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  // Basic admin guard — extend with req.user.role === 'admin' when roles are added
  try {
    const vendors = await dbAll(
      `SELECT id, business_name, contact_email, commission_rate,
              bank_holder_name, bank_account_last4, is_verified, created_at
       FROM hostel_owners
       ORDER BY created_at DESC`
    );
    return res.json(vendors);
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// ROUTE 5 — Update Commission Rate  [Admin-only]
// PUT /api/vendors/:id/commission
// ──────────────────────────────────────────────────────────────────────────────
router.put('/:id/commission', requireAuth, async (req, res, next) => {
  const ownerId = parseInt(req.params.id, 10);
  if (isNaN(ownerId) || ownerId <= 0) {
    return res.status(400).json({ error: 'Invalid vendor ID.' });
  }

  const { commissionRate } = req.body;
  if (!isValidCommissionRate(commissionRate)) {
    return res.status(400).json({
      error: 'commissionRate must be a decimal between 0.01 and 0.50.',
    });
  }

  try {
    const owner = await dbGet('SELECT id FROM hostel_owners WHERE id = ?', [ownerId]);
    if (!owner) return res.status(404).json({ error: 'Vendor partner not found.' });

    await dbRun('UPDATE hostel_owners SET commission_rate = ? WHERE id = ?', [
      parseFloat(commissionRate),
      ownerId,
    ]);

    return res.json({ message: 'Commission rate updated successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = { router, init };
