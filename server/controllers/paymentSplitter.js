/**
 * =============================================================================
 * IMXX NOMAD — Payment Splitter Utility
 * utils/paymentSplitter.js
 *
 * Purpose: Pure, stateless functions for calculating the commission split
 *          between the IMXX platform and a partner hostel vendor.
 *
 * Design Principles:
 *   - All arithmetic is done in integer cents (not floating-point dollars)
 *     to eliminate IEEE-754 rounding errors that could misallocate money.
 *   - Input validation is strict and throws typed errors with safe messages.
 *   - No I/O, no side effects — these are pure calculation functions.
 *   - Every exported function is independently testable.
 * =============================================================================
 */

'use strict';

// ──────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Convert a dollar amount (float) to an integer number of cents.
 * Safe against values like 19.99 → 1999 (not 1998.9999999...)
 * @param {number} dollars
 * @returns {number} integer cents
 */
function toCents(dollars) {
  return Math.round(dollars * 100);
}

/**
 * Convert an integer number of cents back to a dollar float, rounded to 2dp.
 * @param {number} cents
 * @returns {number} dollar amount (2 decimal places)
 */
function fromCents(cents) {
  return parseFloat((cents / 100).toFixed(2));
}

/**
 * Validate a numeric value is a finite, positive number.
 * @param {*} value
 * @param {string} label  - Used in error messages
 * @throws {Error} if invalid
 */
function assertPositiveFinite(value, label) {
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new TypeError(`[PaymentSplitter] '${label}' must be a finite number. Received: ${value}`);
  }
  if (value <= 0) {
    throw new RangeError(
      `[PaymentSplitter] '${label}' must be greater than zero. Received: ${value}`
    );
  }
}

/**
 * Validate that a commission rate is a fraction between 0 (exclusive) and 1 (inclusive).
 * @param {number} rate
 * @throws {Error} if out of range
 */
function assertValidCommissionRate(rate) {
  if (typeof rate !== 'number' || !isFinite(rate)) {
    throw new TypeError(
      `[PaymentSplitter] 'commissionRate' must be a finite number. Received: ${rate}`
    );
  }
  if (rate <= 0 || rate > 1) {
    throw new RangeError(
      `[PaymentSplitter] 'commissionRate' must be between 0 (exclusive) and 1 (inclusive). ` +
        `Received: ${rate}. Example: pass 0.10 for a 10% platform cut.`
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// PRIMARY EXPORT: calculateSplitPayment
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Calculate the IMXX platform commission and the vendor's net payout from a
 * hostel booking total.
 *
 * All arithmetic is performed in integer cents to avoid floating-point drift.
 * The vendor always receives the remainder after the commission is deducted,
 * so the two amounts will always sum exactly to bookingTotal.
 *
 * @param {number} bookingTotal     - Grand total charged to the customer (USD).
 *                                    Must be a positive finite number.
 *                                    Example: 250.00
 *
 * @param {number} commissionRate   - Platform cut expressed as a decimal fraction.
 *                                    Must be between 0 (exclusive) and 1 (inclusive).
 *                                    Example: 0.10  → 10% platform cut
 *                                             0.15  → 15% platform cut
 *
 * @returns {{
 *   bookingTotal:         number,   // Original amount (echoed back for audit trail)
 *   commissionRate:       number,   // Rate used (echoed back for audit trail)
 *   platformCommission:   number,   // Amount IMXX retains  (2dp, USD)
 *   vendorPayout:         number,   // Amount transferred to partner owner (2dp, USD)
 *   platformCommissionPct: string,  // Human-readable percentage string e.g. "10.00%"
 *   calculatedAt:         string    // ISO timestamp of calculation
 * }}
 *
 * @throws {TypeError}  if any argument is not a finite number
 * @throws {RangeError} if bookingTotal ≤ 0 or commissionRate is out of [0, 1]
 *
 * @example
 * calculateSplitPayment(250.00, 0.10)
 * // → { bookingTotal: 250, commissionRate: 0.1, platformCommission: 25,
 * //     vendorPayout: 225, platformCommissionPct: '10.00%', calculatedAt: '...' }
 *
 * @example
 * calculateSplitPayment(19.99, 0.15)
 * // → { platformCommission: 3, vendorPayout: 16.99, ... }
 * // (avoids floating-point: 19.99 * 0.15 = 2.9985 → rounds to $3.00)
 */
function calculateSplitPayment(bookingTotal, commissionRate) {
  // ── Input Validation ──────────────────────────────────────────────────────
  assertPositiveFinite(bookingTotal, 'bookingTotal');
  assertValidCommissionRate(commissionRate);

  // ── Integer Cent Arithmetic ───────────────────────────────────────────────
  const totalCents = toCents(bookingTotal);
  const commissionCents = Math.round(totalCents * commissionRate); // rounds half-up
  const payoutCents = totalCents - commissionCents; // exact remainder

  // ── Convert back to dollars ───────────────────────────────────────────────
  const platformCommission = fromCents(commissionCents);
  const vendorPayout = fromCents(payoutCents);

  // ── Sanity check (should never fail due to integer math, but defensive) ───
  const resum = toCents(platformCommission) + toCents(vendorPayout);
  if (resum !== totalCents) {
    // In production, surface this to an error monitoring service (Sentry etc.)
    console.error(
      `[PaymentSplitter CRITICAL] Split does not sum to total! ` +
        `Expected ${totalCents}¢, got ${resum}¢.`
    );
  }

  return {
    bookingTotal: parseFloat(bookingTotal.toFixed(2)),
    commissionRate,
    platformCommission,
    vendorPayout,
    platformCommissionPct: `${(commissionRate * 100).toFixed(2)}%`,
    calculatedAt: new Date().toISOString(),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// SECONDARY EXPORTS: formatting & audit helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Format a numeric dollar amount as a safe, display-ready string.
 * @param {number} amount
 * @param {string} [currencyCode='USD']
 * @returns {string}  e.g. "$1,250.00"
 */
function formatCurrency(amount, currencyCode = 'USD') {
  if (typeof amount !== 'number' || !isFinite(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Build a structured audit log entry for a payout event.
 * Designed to be inserted directly into the hostel_payout_ledger table.
 *
 * @param {object} params
 * @param {number} params.bookingId
 * @param {number} params.hostelOwnerId
 * @param {object} params.split - result of calculateSplitPayment()
 * @param {string} params.payoutReference - Stripe transfer ID or mock ref
 * @param {string} [params.status='pending']
 * @returns {object}
 */
function buildLedgerEntry({
  bookingId,
  hostelOwnerId,
  split,
  payoutReference,
  status = 'pending',
}) {
  return {
    booking_id: bookingId,
    hostel_owner_id: hostelOwnerId,
    booking_total: split.bookingTotal,
    commission_rate: split.commissionRate,
    commission_amount: split.platformCommission,
    vendor_payout_amount: split.vendorPayout,
    payout_status: status,
    payout_reference: payoutReference || null,
    created_at: split.calculatedAt,
  };
}

module.exports = {
  calculateSplitPayment,
  formatCurrency,
  buildLedgerEntry,
  // Expose internals for unit testing
  _toCents: toCents,
  _fromCents: fromCents,
};
