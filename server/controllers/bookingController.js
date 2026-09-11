/**
 * /src/controllers/bookingController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Booking CRUD controller — manages the 7-step wizard state server-side.
 *
 * Steps aligned:
 *   Step 1 (Dates)        → stored in check_in, check_out
 *   Step 2 (Room config)  → stored in room_type, guests
 *   Step 3 (Addons)       → stored in addons (JSON)
 *   Step 4 (Guest Info)   → stored in guest_name, guest_email, guest_phone, special_requests
 *   Step 5 (Review)       → GET /api/bookings/:id
 *   Step 6 (Payment)      → handled by paymentController.js
 *   Step 7 (Confirmation) → GET /api/bookings/:id returns status='confirmed' + ref
 *
 * All handlers wrapped with asyncHandler — no silent try/catch swallowing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { dbRun, dbGet, dbAll } = require('../config/database');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists at root level
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage logic
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation logic
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif/;
  const isExtValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const isMimeValid = allowedExtensions.test(file.mimetype);
  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, GIF) are allowed for receipts.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

/**
 * Sanitize a string: trim + basic XSS stripping.
 */
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * POST /api/bookings
 * Creates a new booking record (called after Step 4 / before Step 6).
 * Validated upstream by validate(schemas.createBooking).
 */
const createBooking = asyncHandler(async (req, res) => {
  const {
    itemName, totalPrice, paymentIntentId, utr,
    destinationId, checkIn, checkOut, guests,
    guestName, guestEmail, guestPhone, specialRequests, addons,
  } = req.body;

  const transactionRef = paymentIntentId || utr;
  const status = paymentIntentId ? 'pending' : 'pending_utr';

  const result = await dbRun(
    `INSERT INTO bookings
       (user_id, item_name, total_price, utr, status,
        destination_id, check_in, check_out, guests,
        guest_name, guest_email, guest_phone, special_requests, addons, payment_intent_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user ? req.user.id : 0,
      sanitize(itemName),
      sanitize(String(totalPrice)),
      sanitize(transactionRef),
      status,
      destinationId || null,
      checkIn  || null,
      checkOut || null,
      guests   || 1,
      sanitize(guestName  || req.user.fullName || ''),
      sanitize(guestEmail || req.user.email    || ''),
      sanitize(guestPhone || ''),
      sanitize(specialRequests || ''),
      addons ? JSON.stringify(addons) : null,
      paymentIntentId || null,
    ]
  );

  const bookingRef = `IMXX-${String(result.lastID).padStart(6, '0')}`;

  res.status(201).json({
    success:   true,
    message:   'Booking created successfully.',
    bookingId: result.lastID,
    bookingRef,
  });
});

/**
 * GET /api/bookings
 * Fetch all bookings for the authenticated user (dashboard / order history).
 */
const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await dbAll(
    `SELECT b.*, d.name as destination_name, d.image as destination_image
     FROM bookings b
     LEFT JOIN destinations d ON d.id = b.destination_id
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
    [req.user.id]
  );

  // Parse addons JSON safely
  const formatted = bookings.map(b => ({
    ...b,
    addons:    safeJson(b.addons),
    bookingRef: `IMXX-${String(b.id).padStart(6, '0')}`,
  }));

  res.json({ success: true, data: formatted });
});

/**
 * GET /api/bookings/:id
 * Fetch a single booking by ID — used by Step 5 (Review) and Step 7 (Confirmation).
 * Only returns bookings belonging to the requesting user.
 */
const getBookingById = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (isNaN(bookingId)) throw createError('Invalid booking ID.', 400);

  const booking = await dbGet(
    `SELECT b.*, d.name as destination_name, d.image as destination_image, d.description as destination_desc
     FROM bookings b
     LEFT JOIN destinations d ON d.id = b.destination_id
     WHERE b.id = ? AND b.user_id = ?`,
    [bookingId, req.user.id]
  );

  if (!booking) throw createError('Booking not found.', 404);

  res.json({
    success: true,
    data: {
      ...booking,
      addons:     safeJson(booking.addons),
      bookingRef: `IMXX-${String(booking.id).padStart(6, '0')}`,
    },
  });
});

/**
 * PATCH /api/bookings/:id/guest-info
 * Step 4: update guest information on an existing draft booking.
 * Validated upstream by validate(schemas.guestInfo).
 */
const updateGuestInfo = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (isNaN(bookingId)) throw createError('Invalid booking ID.', 400);

  const userId = req.user ? req.user.id : 0;
  const booking = await dbGet('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [bookingId, userId]);
  if (!booking) throw createError('Booking not found.', 404);
  if (!['pending', 'pending_utr', 'draft'].includes(booking.status)) {
    throw createError('Cannot modify a booking that has already been confirmed or completed.', 400);
  }

  const { fullName, email, phone, address, country, specialRequests } = req.body;

  await dbRun(
    `UPDATE bookings
     SET guest_name = ?, guest_email = ?, guest_phone = ?,
         guest_address = ?, guest_country = ?, special_requests = ?
     WHERE id = ?`,
    [
      sanitize(fullName),
      sanitize(email),
      sanitize(phone || ''),
      sanitize(address || ''),
      sanitize(country || ''),
      sanitize(specialRequests || ''),
      bookingId,
    ]
  );

  res.json({ success: true, message: 'Guest information updated.' });
});

/**
 * POST /api/bookings/direct-transfer
 * Customer submits transaction proof (UTR reference ID) for direct bank/UPI transfer.
 */
const createDirectTransferBooking = asyncHandler(async (req, res) => {
  const {
    itemName, totalPrice, utr, destinationId, checkIn, checkOut, guests,
    guestName, guestEmail, guestPhone, specialRequests, addons
  } = req.body;

  const finalUtr = utr || 'P2P_SCREENSHOT';

  // Insert into bookings table
  const result = await dbRun(
    `INSERT INTO bookings
       (user_id, item_name, total_price, utr, status,
        destination_id, check_in, check_out, guests,
        guest_name, guest_email, guest_phone, special_requests, addons)
     VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user ? req.user.id : 0,
      sanitize(itemName),
      sanitize(String(totalPrice)),
      sanitize(finalUtr),
      destinationId || null,
      checkIn || null,
      checkOut || null,
      guests || 1,
      sanitize(guestName || req.user?.fullName || ''),
      sanitize(guestEmail || req.user?.email || ''),
      sanitize(guestPhone || ''),
      sanitize(specialRequests || ''),
      addons ? JSON.stringify(addons) : null
    ]
  );

  const bookingRef = `IMXX-${String(result.lastID).padStart(6, '0')}`;

  res.status(201).json({
    success: true,
    message: 'Direct transfer proof submitted successfully. Pending verification.',
    bookingId: result.lastID,
    bookingRef
  });
});

/**
 * GET /api/admin/bookings
 * Fetch all bookings across the platform for Admin verification.
 * Requires admin privileges.
 */
const getAdminBookings = asyncHandler(async (req, res) => {
  const bookings = await dbAll(
    `SELECT b.*, u.full_name as user_name, u.email as user_email
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     ORDER BY b.created_at DESC`
  );

  const formatted = bookings.map(b => ({
    ...b,
    addons: safeJson(b.addons),
    bookingRef: `IMXX-${String(b.id).padStart(6, '0')}`
  }));

  res.json({ success: true, data: formatted });
});

/**
 * PUT /api/admin/bookings/:id/verify
 * Update direct transfer booking status to SUCCESS or REJECTED.
 * Requires admin privileges.
 */
const verifyBookingPayment = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (isNaN(bookingId)) throw createError('Invalid booking ID.', 400);

  const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  if (!booking) throw createError('Booking not found.', 404);

  // Accept custom status from request body
  const newStatus = req.body.status || 'SUCCESS';
  if (newStatus !== 'SUCCESS' && newStatus !== 'REJECTED') {
    throw createError('Invalid status value. Must be SUCCESS or REJECTED.', 400);
  }

  // Update status in SQLite
  await dbRun('UPDATE bookings SET status = ? WHERE id = ?', [newStatus, bookingId]);

  res.json({
    success: true,
    message: `Booking ${bookingId} has been successfully updated to status: ${newStatus}.`
  });
});

/**
 * POST /api/bookings/:id/upload-screenshot
 * Accept file upload for booking payment confirmation screenshots.
 * Sets status to 'AWAITING_CONFIRMATION'.
 */
const uploadScreenshot = [
  upload.single('screenshot'),
  asyncHandler(async (req, res) => {
    const bookingId = parseInt(req.params.id, 10);
    if (isNaN(bookingId)) throw createError('Invalid booking ID.', 400);

    if (!req.file) {
      throw createError('No payment screenshot file uploaded.', 400);
    }

    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) throw createError('Booking not found.', 404);

    const relativeUrl = `/uploads/${req.file.filename}`;
    const paymentMessage = req.body.message || '';
    const utr = req.body.utr || '';
    const nowTimestamp = new Date().toISOString();

    await dbRun(
      "UPDATE bookings SET status = 'AWAITING_CONFIRMATION', screenshot_path = ?, payment_message = ?, screenshot_uploaded_at = ?, utr = COALESCE(NULLIF(?, ''), utr) WHERE id = ?",
      [relativeUrl, paymentMessage, nowTimestamp, utr, bookingId]
    );

    res.json({
      success: true,
      message: 'Screenshot uploaded. Status set to AWAITING_CONFIRMATION.',
      screenshotPath: relativeUrl,
      paymentMessage,
      screenshotUploadedAt: nowTimestamp
    });
  })
];

/**
 * GET /api/bookings/:id/status
 * Return status of a specific booking for wizard polling.
 */
const getBookingStatus = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id, 10);
  if (isNaN(bookingId)) throw createError('Invalid booking ID.', 400);

  const booking = await dbGet('SELECT status, item_name, total_price, screenshot_path, payment_message, screenshot_uploaded_at FROM bookings WHERE id = ?', [bookingId]);
  if (!booking) throw createError('Booking not found.', 404);

  res.json({
    success: true,
    status: booking.status,
    itemName: booking.item_name,
    totalPrice: booking.total_price,
    screenshotPath: booking.screenshot_path,
    paymentMessage: booking.payment_message,
    screenshotUploadedAt: booking.screenshot_uploaded_at
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function safeJson(str) {
  if (!str) return null;
  try { return JSON.parse(str); } catch { return str; }
}

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateGuestInfo,
  createDirectTransferBooking,
  getAdminBookings,
  verifyBookingPayment,
  uploadScreenshot,
  getBookingStatus
};
