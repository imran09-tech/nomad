const { dbRun, dbGet, dbAll } = require('../config/database');
const { asyncHandler, createError } = require('../middleware/errorHandler');

/**
 * createTrade - Initializes a mock P2P trade transaction (for testing/setup)
 */
const createTrade = asyncHandler(async (req, res) => {
  const { buyerId, sellerId, cryptoAmount, cryptoAsset, fiatAmount, fiatCurrency } = req.body;

  if (!buyerId || !sellerId || !cryptoAmount || !cryptoAsset || !fiatAmount || !fiatCurrency) {
    throw createError('Missing required trade initialization parameters.', 400);
  }

  const tradeId = `TRADE-${Math.floor(100000 + Math.random() * 900000)}`;

  await dbRun(
    `INSERT INTO p2p_trades (id, buyer_id, seller_id, crypto_amount, crypto_asset, fiat_amount, fiat_currency, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_PAYMENT')`,
    [tradeId, buyerId, sellerId, cryptoAmount, cryptoAsset, fiatAmount, fiatCurrency]
  );

  res.status(201).json({
    success: true,
    tradeId,
    status: 'PENDING_PAYMENT',
    message: 'P2P trade initialized. Escrow locked.'
  });
});

/**
 * submitPaymentProof - Uploads payment screenshot, verifies UTR against duplicates,
 * and sets trade status to PENDING_VERIFICATION.
 */
const submitPaymentProof = asyncHandler(async (req, res) => {
  const { tradeId } = req.params;
  const { utr, note } = req.body;

  if (!utr) {
    throw createError('Transaction UTR/Reference number is required.', 400);
  }

  if (!req.file) {
    throw createError('Payment proof screenshot file is required.', 400);
  }

  const trade = await dbGet('SELECT * FROM p2p_trades WHERE id = ?', [tradeId]);
  if (!trade) {
    throw createError('Trade not found.', 404);
  }

  if (trade.status !== 'PENDING_PAYMENT') {
    throw createError(`Invalid action. Trade is in status: ${trade.status}`, 400);
  }

  // Anti-fraud: check for duplicate UTR within the last 48 hours
  const duplicate = await dbGet(
    `SELECT * FROM p2p_payment_proofs 
     WHERE utr_reference = ? 
     AND datetime(uploaded_at) >= datetime('now', '-2 days')`,
    [utr]
  );

  const relativeUrl = `/uploads/${req.file.filename}`;
  const now = new Date().toISOString();

  // If a duplicate UTR is found, immediately transition the trade to DISPUTED to prevent fraud
  if (duplicate) {
    await dbRun(
      `UPDATE p2p_trades SET status = 'DISPUTED' WHERE id = ?`,
      [tradeId]
    );

    // Save proof as flagged record
    await dbRun(
      `INSERT INTO p2p_payment_proofs (trade_id, buyer_id, utr_reference, proof_image_url, message_note, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tradeId, trade.buyer_id, utr, relativeUrl, `[SYSTEM WARNING: DUPLICATE UTR DETECTED] ${note || ''}`, now]
    );

    return res.status(400).json({
      success: false,
      status: 'DISPUTED',
      error: 'Fraud Alert: Duplicate transaction reference detected. This trade has been flagged and suspended. Admin mediator is reviewing.'
    });
  }

  // Insert payment proof record
  await dbRun(
    `INSERT INTO p2p_payment_proofs (trade_id, buyer_id, utr_reference, proof_image_url, message_note, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tradeId, trade.buyer_id, utr, relativeUrl, note || null, now]
  );

  // Transition trade to PENDING_VERIFICATION
  await dbRun(
    `UPDATE p2p_trades SET status = 'PENDING_VERIFICATION' WHERE id = ?`,
    [tradeId]
  );

  res.json({
    success: true,
    status: 'PENDING_VERIFICATION',
    message: 'Payment proof submitted. Awaiting administrator verification.'
  });
});

/**
 * verifyTradePayment - Allows admin to verify trade payment and release escrow (APPROVE) or reject (DISPUTE)
 */
const verifyTradePayment = asyncHandler(async (req, res) => {
  const { tradeId } = req.params;
  const { action, rejectionReason } = req.body;

  if (action !== 'APPROVE' && action !== 'REJECT') {
    throw createError('Action must be either APPROVE or REJECT.', 400);
  }

  const trade = await dbGet('SELECT * FROM p2p_trades WHERE id = ?', [tradeId]);
  if (!trade) {
    throw createError('Trade not found.', 404);
  }

  if (trade.status !== 'PENDING_VERIFICATION') {
    throw createError('Payment proof must be submitted before verification can be processed.', 400);
  }

  const finalStatus = action === 'APPROVE' ? 'COMPLETED' : 'DISPUTED';
  const adminId = req.user ? req.user.id : 1; // Default to admin 1 for mock integrations

  // Save admin audit log
  await dbRun(
    `INSERT INTO p2p_admin_verifications (trade_id, admin_id, action, rejection_reason)
     VALUES (?, ?, ?, ?)`,
    [tradeId, adminId, action, rejectionReason || null]
  );

  // Update overall trade status
  await dbRun(
    `UPDATE p2p_trades SET status = ? WHERE id = ?`,
    [finalStatus, tradeId]
  );

  res.json({
    success: true,
    tradeId,
    status: finalStatus,
    message: action === 'APPROVE' 
      ? 'Escrow released successfully. Funds routed to Buyer.' 
      : `Trade verification rejected. Status set to DISPUTED. Reason: ${rejectionReason || 'N/A'}`
  });
});

/**
 * getTradeDetails - Fetches trade parameters, proof submissions, and verification logs
 */
const getTradeDetails = asyncHandler(async (req, res) => {
  const { tradeId } = req.params;

  const trade = await dbGet(
    `SELECT t.*, 
            p.utr_reference, p.proof_image_url, p.message_note, p.uploaded_at as proof_uploaded_at,
            v.action as admin_action, v.rejection_reason as admin_rejection_reason, v.verified_at
     FROM p2p_trades t
     LEFT JOIN p2p_payment_proofs p ON p.trade_id = t.id
     LEFT JOIN p2p_admin_verifications v ON v.trade_id = t.id
     WHERE t.id = ?`,
    [tradeId]
  );

  if (!trade) {
    throw createError('Trade not found.', 404);
  }

  res.json({
    success: true,
    data: trade
  });
});

module.exports = {
  createTrade,
  submitPaymentProof,
  verifyTradePayment,
  getTradeDetails
};
