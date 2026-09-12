const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS || '',
  },
});
const twilio = require('twilio');
let twilioClient = null;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
if (
  accountSid &&
  accountSid.startsWith('AC') &&
  authToken &&
  !authToken.includes('placeholder') &&
  !authToken.includes('here')
) {
  twilioClient = twilio(accountSid, authToken);
}

const { initializeDatabase, dbRun, dbGet, dbAll } = require('./config/database');

// ── Modular Middleware ────────────────────────────────────────────────────────
const { globalErrorHandler, asyncHandler, createError } = require('./middleware/errorHandler');
const { validate, schemas } = require('./middleware/validate');
const {
  authenticateToken: authMiddleware,
  authenticateOptional,
  restrictTo,
} = require('./middleware/auth');

// ── Modular Controllers ───────────────────────────────────────────────────────
const { createPaymentIntent, stripeWebhook } = require('./controllers/paymentController');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  updateGuestInfo,
  createDirectTransferBooking,
  getAdminBookings,
  verifyBookingPayment,
  uploadScreenshot,
  getBookingStatus,
} = require('./controllers/bookingController');

// ── Multi-Vendor Payout Architecture ────────────────────────────────────────
const { calculateSplitPayment, buildLedgerEntry } = require('./controllers/paymentSplitter');
const vendorRouterModule = require('./routes/vendors');

// ── Channel Manager / GDS Integration Layer ──────────────────────────────
const propertiesRouterModule = require('./routes/properties');
const channelWebhookRouterModule = require('./routes/channelWebhook');
const transitRoutes = require('./routes/transitRoutes');
const trainRoutes = require('./routes/trainRoutes');

// --- Guard: Fail fast if critical env vars are missing ---
const REQUIRED_ENV = ['JWT_SECRET', 'STRIPE_SECRET_KEY', 'GEMINI_API_KEY'];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(
      `[FATAL] Missing required environment variable: ${key}. Add it to your .env file.`
    );
    process.exit(1);
  }
});

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5000';

// ─────────────────────────────────────────────
//  SECURITY MIDDLEWARE
// ─────────────────────────────────────────────

// 1. Helmet: sets secure HTTP headers automatically
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP to allow inline event handlers & scripts in local dev
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false, // Allow media (videos/images) to be loaded cross-origin
  })
);

// 2. CORS: allow local development port 8080 alongside client origin
app.use(
  cors({
    origin: true, // Allow all origins for dev/local testing
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));

// ── Static Assets Middleware ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/pic', express.static(path.join(__dirname, '../pic')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// ── Raw body capture for Stripe webhook signature verification ────────────────
// MUST come BEFORE express.json() for the webhook route only.
// We save the raw Buffer on req so stripe.webhooks.constructEvent() can verify
// the HMAC signature. If we run it through JSON parsing first, the signature fails.
app.use('/api/bookings/checkout-success', express.raw({ type: 'application/json' }));

// 3. Rate Limiters
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 login/register attempts per minute
  message: { error: 'Too many authentication attempts. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // 150 requests per window
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply limiters
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Dedicated limiter for property search (CM APIs are paid-per-call)
// 20 searches/min per IP is generous for human use, restrictive for scrapers.
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many search requests. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/properties/search', searchLimiter);

// Dedicated limiter for channel manager webhook inbound
// 120/min covers CM batch-flush events; higher than general API.
const webhookCMLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Too many webhook requests.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/webhooks/channel-manager', webhookCMLimiter);

// Reserve endpoint is per-user 10/min (booking frequency limit)
const reserveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id?.toString() || req.socket.remoteAddress,
  validate: false,
  message: { error: 'Too many booking attempts. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/webhooks/channel-manager/reserve', reserveLimiter);

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/pic', express.static(path.join(__dirname, '../pic')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Destination Video Upload & Range-Streaming Layer ────────────────────────
const videoUploadDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads', 'videos')
  : path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `video-${req.params.id || 'dest'}-${uniqueSuffix}${ext}`);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v', '.flv'];
    if (file.mimetype.startsWith('video/') || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (.mp4, .webm, .mov, .avi, .mkv) are allowed.'));
    }
  },
});

// POST /api/destinations/:id/video - Upload video into disk & SQLite nomad.db
app.post('/api/destinations/:id/video', (req, res, next) => {
  videoUpload.single('video')(req, res, async (err) => {
    if (err) {
      console.error('[Video Upload Error]', err);
      return res.status(400).json({ success: false, error: err.message || 'Video upload failed.' });
    }

    try {
      let destinationId = parseInt(req.params.id, 10);
      if (isNaN(destinationId) && req.params.id) {
        const match = String(req.params.id).match(/\d+/);
        if (match) destinationId = parseInt(match[0], 10);
      }
      if (isNaN(destinationId)) {
        return res.status(400).json({ success: false, error: 'Invalid destination ID.' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No video file uploaded.' });
      }

      // Public URL path served via static express middleware
      const videoUrl = `/uploads/videos/${req.file.filename}`;
      const videoMime = req.file.mimetype || 'video/mp4';

      // Read small buffer (<5MB) for SQLite BLOB storage to prevent memory overflow
      let videoBuffer = null;
      if (req.file.size < 5 * 1024 * 1024) {
        try {
          videoBuffer = fs.readFileSync(req.file.path);
        } catch (_) {}
      }

      // Upsert into SQLite nomad.db file
      const existing = await dbGet('SELECT id FROM destinations WHERE id = ?', [destinationId]);
      if (existing) {
        await dbRun(
          'UPDATE destinations SET video_blob = ?, video_mime = ?, video_url = ? WHERE id = ?',
          [videoBuffer, videoMime, videoUrl, destinationId]
        );
      } else {
        await dbRun(
          'INSERT INTO destinations (id, name, type, location_text, video_blob, video_mime, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            destinationId,
            `Destination #${destinationId}`,
            'destination',
            'Global',
            videoBuffer,
            videoMime,
            videoUrl,
          ]
        );
      }

      console.log(`[Video Saved] Destination ID ${destinationId} -> ${videoUrl}`);

      res.json({
        success: true,
        message: 'Video uploaded and saved to local database successfully.',
        videoUrl: videoUrl,
        destinationId: destinationId,
      });
    } catch (dbErr) {
      console.error('[Video DB Save Error]', dbErr);
      res
        .status(500)
        .json({ success: false, error: 'Failed to save video to database: ' + dbErr.message });
    }
  });
});
// ─── Destination Image Upload Layer ────────────────────────
const imageUploadDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads', 'images')
  : path.join(__dirname, '../uploads/images');
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

// Serve static uploaded images
app.use('/uploads/images', express.static(imageUploadDir));

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `image-${req.params.id || 'dest'}-${uniqueSuffix}${ext}`);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (file.mimetype.startsWith('image/') || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (.jpg, .jpeg, .png, .webp, .gif) are allowed.'));
    }
  },
});

// POST /api/destinations/:id/image - Upload image and update SQLite nomad.db
app.post('/api/destinations/:id/image', (req, res, next) => {
  imageUpload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('[Image Upload Error]', err);
      return res.status(400).json({ success: false, error: err.message || 'Image upload failed.' });
    }

    try {
      let destinationId = parseInt(req.params.id, 10);
      if (isNaN(destinationId) && req.params.id) {
        const match = String(req.params.id).match(/\d+/);
        if (match) destinationId = parseInt(match[0], 10);
      }
      if (isNaN(destinationId)) {
        return res.status(400).json({ success: false, error: 'Invalid destination ID.' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image file uploaded.' });
      }

      // Public URL path served via static express middleware
      const imageUrl = `/uploads/images/${req.file.filename}`;

      // Update into SQLite nomad.db file
      const existing = await dbGet('SELECT id FROM destinations WHERE id = ?', [destinationId]);
      if (existing) {
        await dbRun('UPDATE destinations SET image = ? WHERE id = ?', [imageUrl, destinationId]);
      } else {
        await dbRun(
          'INSERT INTO destinations (id, name, type, location_text, image) VALUES (?, ?, ?, ?, ?)',
          [destinationId, `Destination #${destinationId}`, 'destination', 'Global', imageUrl]
        );
      }

      console.log(`[Image Saved] Destination ID ${destinationId} -> ${imageUrl}`);

      res.json({
        success: true,
        message: 'Image uploaded and saved to local database successfully.',
        imageUrl: imageUrl,
        destinationId: destinationId,
      });
    } catch (dbErr) {
      console.error('[Image DB Save Error]', dbErr);
      res
        .status(500)
        .json({ success: false, error: 'Failed to save image to database: ' + dbErr.message });
    }
  });
});

// ─────────────────────────────────────────────
//  AUTH MIDDLEWARE (modular — see src/middleware/auth.js)
// ─────────────────────────────────────────────
// Re-export for legacy inline routes still in this file
const authenticateToken = authMiddleware;

// Simple XSS sanitizer for user input (still used by legacy inline routes)
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ── Mount Vendor / Partner Router ────────────────────────────────────────────
// Inject shared dependencies AFTER middleware is defined to avoid undefined refs.
vendorRouterModule.init({ dbRun, dbGet, dbAll, authenticateToken, sanitize, stripe });
app.use('/api/vendors', vendorRouterModule.router);

// ── Mount Channel Manager / GDS Routers ─────────────────────────────────────
propertiesRouterModule.init({ authenticateToken, dbRun, dbGet, dbAll });
app.use('/api/properties', propertiesRouterModule.router);

channelWebhookRouterModule.init({ dbRun, dbGet, dbAll, authenticateToken, sanitize, stripe });
app.use('/api/webhooks/channel-manager', channelWebhookRouterModule.router);

// ── Mount Transit Router ────────────────────────────────────────────────────
app.use('/api/v1/transit', transitRoutes);
app.use('/api/v1/trains', trainRoutes);
app.use('/api/v1/train', trainRoutes);

// ── Mount P2P Crypto Trading Router ──────────────────────────────────────────
const p2pRouter = require('./routes/p2pRoutes');
app.use('/api/v1/p2p', p2pRouter);

// ─────────────────────────────────────────────
//  AUTHENTICATION ROUTES
// ─────────────────────────────────────────────

// Request Signup via Email OTP
app.post(
  '/api/auth/signup-request',
  validate(schemas.signupRequest),
  asyncHandler(async (req, res) => {
    const { email, password, fullName, username, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) throw createError('An account with this email already exists.', 409);

    const existingUsername = await dbGet('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsername) throw createError('This username is already taken.', 409);

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Clean up any stale pending registration for this email
    await dbRun('DELETE FROM pending_users WHERE email = ?', [email]);

    // Insert into pending registrations
    await dbRun(
      'INSERT INTO pending_users (email, password_hash, full_name, username, phone_number, verification_code, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        email,
        passwordHash,
        sanitize(fullName),
        sanitize(username),
        phoneNumber || null,
        code,
        expires,
      ]
    );

    // Send Email via Nodemailer if SMTP configured, else fallback to console
    if (process.env.SMTP_PASS) {
      try {
        await mailer.sendMail({
          from: process.env.EMAIL_FROM || 'no-reply@imxx.com',
          to: email,
          subject: 'IMXX Premium - Verify Your Email',
          text: `Your IMXX Premium registration code is: ${code}`,
        });
        console.log(`[Mailer] Sent registration Email to ${email}`);
      } catch (err) {
        console.error('[Mailer Error]', err);
        throw createError(
          'Failed to send email verification code. Please check your email address.',
          500
        );
      }
    } else {
      // Simulate sending Email via gateway
      console.log(`\n==========================================`);
      console.log(`[EMAIL SIGNUP GATEWAY SIMULATION]`);
      console.log(`To: ${email}`);
      console.log(`Message: Your IMXX Premium registration code is: ${code}`);
      console.log(`==========================================\n`);
    }

    res.json({
      success: true,
      message: 'Verification code sent successfully via Email.',
      smsDebugCode: code,
    });
  })
);

// Verify Email OTP Code and Complete Registration
app.post(
  '/api/auth/signup-verify',
  validate(schemas.signupVerify),
  asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    const pending = await dbGet('SELECT * FROM pending_users WHERE email = ?', [email]);
    if (!pending) throw createError('No pending registration found for this email address.', 400);

    if (pending.verification_code !== code) {
      throw createError('Invalid verification code.', 400);
    }

    if (new Date(pending.expires_at) < new Date()) {
      throw createError('Verification code has expired.', 400);
    }

    // Double check if email or username has been taken in the meantime
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [pending.email]);
    if (existingUser) throw createError('An account with this email already exists.', 409);

    const existingUsername = await dbGet('SELECT id FROM users WHERE username = ?', [
      pending.username,
    ]);
    if (existingUsername) throw createError('This username is already taken.', 409);

    const defaultAvatar = `../pic/logo.png`; // Set default avatar to the brand's logo!

    // Insert into users
    const result = await dbRun(
      'INSERT INTO users (email, password_hash, full_name, username, currency, avatar_url, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        pending.email,
        pending.password_hash,
        pending.full_name,
        pending.username,
        'USD',
        defaultAvatar,
        pending.phone_number,
      ]
    );

    const userId = result.lastID;
    const token = jwt.sign({ id: userId, email: pending.email }, JWT_SECRET, { expiresIn: '7d' });

    // Delete from pending registrations
    await dbRun('DELETE FROM pending_users WHERE id = ?', [pending.id]);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email: pending.email,
        fullName: pending.full_name,
        username: pending.username,
        currency: 'USD',
        avatarUrl: defaultAvatar,
        phoneNumber: pending.phone_number,
      },
    });
  })
);

// Register — validated via Zod schema (strips unknown keys, normalises email)
app.post(
  '/api/auth/register',
  validate(schemas.register),
  asyncHandler(async (req, res) => {
    const { email, password, fullName, username, phoneNumber } = req.body;

    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) throw createError('An account with this email already exists.', 409);

    const existingUsername = await dbGet('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsername) throw createError('This username is already taken.', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=F59E0B&color=fff&size=80`;

    const result = await dbRun(
      'INSERT INTO users (email, password_hash, full_name, username, currency, avatar_url, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        email,
        passwordHash,
        sanitize(fullName),
        sanitize(username),
        'USD',
        defaultAvatar,
        sanitize(phoneNumber || ''),
      ]
    );

    const userId = result.lastID;
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email,
        fullName: sanitize(fullName),
        username: sanitize(username),
        currency: 'USD',
        avatarUrl: defaultAvatar,
        phoneNumber: sanitize(phoneNumber || ''),
      },
    });
  })
);

// Login — Zod validated
app.post(
  '/api/auth/login',
  validate(schemas.login),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await dbGet('SELECT * FROM users WHERE email = ? OR username = ?', [
      email.toLowerCase(),
      email,
    ]);
    if (!user) throw createError('Invalid email or password.', 401); // generic to prevent enumeration

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw createError('Invalid email or password.', 401);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        username: user.username,
        currency: user.currency,
        avatarUrl: user.avatar_url,
        phoneNumber: user.phone_number,
      },
    });
  })
);

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await dbGet(
      'SELECT id, email, full_name, username, currency, avatar_url, phone_number FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      username: user.username,
      currency: user.currency,
      avatarUrl: user.avatar_url,
      phoneNumber: user.phone_number,
    });
  } catch (err) {
    next(err);
  }
});

// Forgot Password API Endpoint
app.post('/api/auth/forgot-password', async (req, res, next) => {
  const { emailOrPhone } = req.body;
  if (!emailOrPhone) {
    return res.status(400).json({ error: 'Please provide email or phone number.' });
  }

  try {
    const term = emailOrPhone.trim().toLowerCase();
    const user = await dbGet(
      'SELECT * FROM users WHERE LOWER(email) = ? OR username = ? OR phone_number = ?',
      [term, emailOrPhone, emailOrPhone]
    );

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email or phone number.' });
    }

    // Generate a random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    await dbRun('UPDATE users SET reset_code = ?, reset_code_expires = ? WHERE id = ?', [
      code,
      expires,
      user.id,
    ]);

    // Send SMS via Twilio if configured and user has a phone number
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER && user.phone_number) {
      try {
        await twilioClient.messages.create({
          body: `Your IMXX Premium verification code is: ${code}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.phone_number,
        });
        console.log(`[Twilio] Sent password reset SMS to ${user.phone_number}`);
      } catch (err) {
        console.error('[Twilio Error]', err);
        return res.status(500).json({ error: 'Failed to send SMS verification code.' });
      }
    } else {
      // Simulate sending SMS via gateway
      console.log(`\n==========================================`);
      console.log(`[SMS GATEWAY SIMULATION]`);
      console.log(`To: ${user.phone_number || 'N/A'}`);
      console.log(`Message: Your IMXX Premium verification code is: ${code}`);
      console.log(`==========================================\n`);
    }

    res.json({
      message: 'Verification code sent successfully via SMS.',
      smsDebugCode: code,
    });
  } catch (err) {
    next(err);
  }
});

// Verify Verification Code API Endpoint
app.post('/api/auth/verify-reset-code', async (req, res, next) => {
  const { emailOrPhone, code } = req.body;
  if (!emailOrPhone || !code) {
    return res.status(400).json({ error: 'Please provide email/phone and code.' });
  }

  try {
    const term = emailOrPhone.trim().toLowerCase();
    const user = await dbGet(
      'SELECT * FROM users WHERE LOWER(email) = ? OR username = ? OR phone_number = ?',
      [term, emailOrPhone, emailOrPhone]
    );

    if (!user || user.reset_code !== code) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    if (new Date(user.reset_code_expires) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired.' });
    }

    res.json({ message: 'Code verified successfully.' });
  } catch (err) {
    next(err);
  }
});

// Reset Password API Endpoint
app.post('/api/auth/reset-password', async (req, res, next) => {
  const { emailOrPhone, code, newPassword } = req.body;
  if (!emailOrPhone || !code || !newPassword) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  try {
    const term = emailOrPhone.trim().toLowerCase();
    const user = await dbGet(
      'SELECT * FROM users WHERE LOWER(email) = ? OR username = ? OR phone_number = ?',
      [term, emailOrPhone, emailOrPhone]
    );

    if (!user || user.reset_code !== code || new Date(user.reset_code_expires) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired verification session.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await dbRun(
      'UPDATE users SET password_hash = ?, reset_code = NULL, reset_code_expires = NULL WHERE id = ?',
      [passwordHash, user.id]
    );

    res.json({ message: 'Password has been successfully updated.' });
  } catch (err) {
    next(err);
  }
});

// Update Profile
app.put('/api/user/profile', authenticateToken, async (req, res, next) => {
  const { fullName, username, email, currency, phoneNumber } = req.body;

  if (!fullName || !username || !email) {
    return res.status(400).json({ error: 'Full name, username, and email are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const allowedCurrencies = ['USD', 'EUR', 'INR', 'GBP', 'AED'];
  const safeCurrency = allowedCurrencies.includes(currency) ? currency : 'USD';

  try {
    const otherUser = await dbGet(
      'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
      [email.toLowerCase(), username, req.user.id]
    );
    if (otherUser) {
      return res
        .status(409)
        .json({ error: 'Email or username is already taken by another account.' });
    }

    await dbRun(
      'UPDATE users SET full_name = ?, username = ?, email = ?, currency = ?, phone_number = ? WHERE id = ?',
      [
        sanitize(fullName),
        sanitize(username),
        email.toLowerCase(),
        safeCurrency,
        sanitize(phoneNumber || ''),
        req.user.id,
      ]
    );

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// Update Avatar URL
app.post('/api/user/avatar', authenticateToken, async (req, res, next) => {
  const { avatarUrl } = req.body;
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    return res.status(400).json({ error: 'A valid avatar URL is required.' });
  }

  try {
    await dbRun('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);
    res.json({ message: 'Avatar updated successfully.', avatarUrl });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
//  DESTINATIONS & CATALOG ROUTES
// ─────────────────────────────────────────────
let imageMapping = {};
try {
  imageMapping = require('../scripts/image_mapping.json');
} catch (err) {
  console.error('Failed to load scripts/image_mapping.json:', err);
}

function getCorrectImagePath(dbImage) {
  if (!dbImage) return dbImage;
  if (
    dbImage.startsWith('http://') ||
    dbImage.startsWith('https://') ||
    dbImage.startsWith('//') ||
    dbImage.startsWith('assets/')
  ) {
    return dbImage;
  }
  if (imageMapping[dbImage]) {
    const mapped = imageMapping[dbImage];
    if (mapped.startsWith('images/')) {
      return 'assets/' + mapped;
    }
    return mapped;
  }

  // Fallback regex heuristics for safety
  const numberMatch = dbImage.match(/\d+/);
  const numberStr = numberMatch ? numberMatch[0] : '';
  const ext = dbImage.endsWith('.png') ? '.png' : '.jpg';

  if (dbImage.startsWith('destination/')) {
    return `assets/images/travel/luxury-destination-vacation-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('hotel/')) {
    return `assets/images/hotels/premium-hotel-suite-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('nature/')) {
    return `assets/images/travel/beautiful-nature-landscape-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('mountain/')) {
    return `assets/images/travel/scenic-mountain-view-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('planets/')) {
    return `assets/images/travel/stargazing-experience-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('sea/')) {
    return `assets/images/travel/ocean-beach-resort-${numberStr}${ext}`;
  }
  if (dbImage.startsWith('college/')) {
    return `assets/images/banners/nomad-travel-${numberStr}${ext}`;
  }

  return dbImage;
}

app.get('/api/destinations', async (req, res, next) => {
  const { type, query } = req.query;

  try {
    let sql = 'SELECT * FROM destinations';
    const params = [];

    if (type && type !== 'all') {
      sql += ' WHERE type = ?';
      params.push(type);
    }

    if (query) {
      const hasWhere = type && type !== 'all';
      sql += hasWhere ? ' AND' : ' WHERE';
      sql += ' (name LIKE ? OR location_text LIKE ? OR data_location_tags LIKE ?)';
      const wildcard = `%${query.replace(/[%_]/g, '\\$&')}%`;
      params.push(wildcard, wildcard, wildcard);
    }

    const rows = await dbAll(sql, params);
    const mappedRows = rows.map((row) => {
      if (row.image) {
        row.image = getCorrectImagePath(row.image);
      }
      return row;
    });
    res.json(mappedRows);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/destinations/:id/video - Delete video from database & disk
app.delete('/api/destinations/:id/video', async (req, res, next) => {
  try {
    let id = parseInt(req.params.id, 10);
    if (isNaN(id) && req.params.id) {
      const match = String(req.params.id).match(/\d+/);
      if (match) id = parseInt(match[0], 10);
    }
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid destination ID.' });
    }

    const row = await dbGet('SELECT video_url FROM destinations WHERE id = ?', [id]);
    if (row && row.video_url && row.video_url.startsWith('/uploads/videos/')) {
      const filePath = path.join(__dirname, '..', row.video_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
      }
    }

    await dbRun(
      'UPDATE destinations SET video_url = NULL, video_blob = NULL, video_mime = NULL WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Video deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/:id/video - Stream video (Disk file preferred, BLOB fallback) with HTTP Range support
app.get('/api/destinations/:id/video', async (req, res, next) => {
  try {
    let id = parseInt(req.params.id, 10);
    if (isNaN(id) && req.params.id) {
      const match = String(req.params.id).match(/\d+/);
      if (match) id = parseInt(match[0], 10);
    }
    if (isNaN(id)) {
      return res.status(400).send('Invalid ID');
    }

    const row = await dbGet(
      'SELECT video_url, video_blob, video_mime FROM destinations WHERE id = ?',
      [id]
    );
    if (!row || (!row.video_blob && !row.video_url)) {
      return res.status(404).send('Video not found');
    }

    // Disk file streaming check
    if (row.video_url && row.video_url.startsWith('/uploads/videos/')) {
      const filePath = path.join(__dirname, '..', row.video_url);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    if (!row.video_blob) {
      return res.status(404).send('Video data missing');
    }

    const videoBuffer = row.video_blob;
    const totalLength = videoBuffer.length;
    const mimeType = row.video_mime || 'video/mp4';

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1;

      if (start >= totalLength || end >= totalLength) {
        res.writeHead(416, { 'Content-Range': `bytes */${totalLength}` });
        return res.end();
      }

      const chunksize = end - start + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
      });
      res.end(videoBuffer.subarray(start, end + 1));
    } else {
      res.writeHead(200, {
        'Content-Length': totalLength,
        'Content-Type': mimeType,
      });
      res.end(videoBuffer);
    }
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
//  BOOKINGS & PAYMENTS ROUTES
// ─────────────────────────────────────────────

// ─── Payment Intent (server-side price — no client price accepted) ────────────
// Uses Zod-validated schema: expects destinationId + dates, NOT a price.
app.post(
  '/api/create-payment-intent',
  authenticateToken,
  validate(schemas.createPaymentIntent),
  createPaymentIntent
);

// ─── Booking CRUD (modular controller) ───────────────────────────────────────
app.post('/api/bookings', authenticateToken, validate(schemas.createBooking), createBooking);
app.post('/api/bookings/direct-transfer', authenticateOptional, createDirectTransferBooking);
app.get('/api/bookings', authenticateToken, getUserBookings);
app.get('/api/bookings/:id', authenticateToken, getBookingById);
app.patch(
  '/api/bookings/:id/guest-info',
  authenticateToken,
  validate(schemas.guestInfo),
  updateGuestInfo
);
app.post('/api/bookings/:id/upload-screenshot', authenticateOptional, uploadScreenshot);
app.get('/api/bookings/:id/status', authenticateOptional, getBookingStatus);

// ─── Auto-Confirm after 5-min timer (no auth required) ───────────────────────
app.put('/api/bookings/:id/auto-confirm', async (req, res) => {
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
app.get('/api/bookings/:id/whatsapp-confirm', async (req, res) => {
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

// ─── Admin Booking Verification & User Management ─────────────────────────────
app.get('/api/admin/bookings', authenticateToken, restrictTo('admin'), getAdminBookings);
app.put(
  '/api/admin/bookings/:id/verify',
  authenticateToken,
  restrictTo('admin'),
  verifyBookingPayment
);

app.get('/api/admin/users', authenticateToken, restrictTo('admin'), async (req, res, next) => {
  try {
    const users = await dbAll(
      'SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

app.put(
  '/api/admin/users/:id/role',
  authenticateToken,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!['user', 'vendor', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified.' });
      }
      await dbRun('UPDATE users SET role = ? WHERE id = ?', [role, id]);
      res.json({ success: true, message: `User role updated to ${role}.` });
    } catch (err) {
      next(err);
    }
  }
);

app.delete(
  '/api/admin/users/:id',
  authenticateToken,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (parseInt(id, 10) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own active admin account.' });
      }
      await dbRun('DELETE FROM users WHERE id = ?', [id]);
      res.json({ success: true, message: 'User deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

app.get('/api/admin/stats', authenticateToken, restrictTo('admin'), async (req, res, next) => {
  try {
    const totalUsers = await dbGet('SELECT COUNT(*) as count FROM users');
    const totalBookings = await dbGet(
      'SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as total_revenue FROM bookings'
    );
    const pendingBookings = await dbGet(
      'SELECT COUNT(*) as count FROM bookings WHERE status IN ("PENDING", "AWAITING_CONFIRMATION")'
    );
    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers ? totalUsers.count : 0,
        totalBookings: totalBookings ? totalBookings.count : 0,
        totalRevenue: totalBookings ? totalBookings.total_revenue : 0,
        pendingBookings: pendingBookings ? pendingBookings.count : 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  HOSTEL MARKETPLACE — Checkout Success Webhook
//  POST /api/bookings/checkout-success
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
//    URL: https://yourdomain.com/api/bookings/checkout-success
//    Events: payment_intent.succeeded
//
//  Local testing (Stripe CLI):
//    stripe listen --forward-to localhost:5000/api/bookings/checkout-success
//    stripe trigger payment_intent.succeeded
// ─────────────────────────────────────────────────────────────────────────────

const WEBHOOK_RATE_LIMIT = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many webhook calls.' },
});

app.post('/api/bookings/checkout-success', WEBHOOK_RATE_LIMIT, async (req, res) => {
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

// ─────────────────────────────────────────────
//  FEEDBACK ROUTES
// ─────────────────────────────────────────────
app.post('/api/feedback', authenticateToken, async (req, res, next) => {
  const { category, rating, message } = req.body;

  if (!category || rating === undefined || !message) {
    return res.status(400).json({ error: 'Category, rating, and message are all required.' });
  }

  const ratingVal = parseInt(rating, 10);
  if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message must be under 2000 characters.' });
  }

  try {
    const result = await dbRun(
      'INSERT INTO feedback (user_id, category, rating, message) VALUES (?, ?, ?, ?)',
      [req.user.id, sanitize(category), ratingVal, sanitize(message)]
    );

    // Async file write — does NOT block the event loop
    const feedbackFilePath = path.join(__dirname, 'feedback.json');
    let feedbackArray = [];
    try {
      const fileContent = await fs.promises.readFile(feedbackFilePath, 'utf8');
      feedbackArray = JSON.parse(fileContent || '[]');
    } catch (_) {
      /* File may not exist yet */
    }

    feedbackArray.push({
      id: result.lastID,
      user_id: req.user.id,
      user_email: req.user.email,
      category,
      rating: ratingVal,
      message,
      created_at: new Date().toISOString(),
    });

    // Fire-and-forget async write
    fs.promises
      .writeFile(feedbackFilePath, JSON.stringify(feedbackArray, null, 2), 'utf8')
      .catch((e) => console.error('[Feedback File Write Error]', e));

    res
      .status(201)
      .json({ message: 'Feedback submitted successfully. Thank you!', feedbackId: result.lastID });
  } catch (err) {
    next(err);
  }
});

app.get('/api/feedback', authenticateToken, async (req, res, next) => {
  try {
    const feedbackList = await dbAll(
      'SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(feedbackList);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
//  SECURE AI CHAT PROXY
// ─────────────────────────────────────────────
app.post('/api/chat', async (req, res, next) => {
  const { contents, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction, contents }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gemini Proxy Error]', response.status, errorText);
      return res.status(response.status).json({ error: 'AI service error. Please try again.' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
//  GLOBAL ERROR HANDLER — modular, production-hardened
//  see src/middleware/errorHandler.js for full classification logic
// ─────────────────────────────────────────────
app.use(globalErrorHandler);

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// SPA fallback for React Router
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ─────────────────────────────────────────────
//  START SERVER OR EXPORT FOR SERVERLESS
// ─────────────────────────────────────────────

if (process.env.VERCEL) {
  // If running on Vercel, we need to initialize the database synchronously or handle it gracefully,
  // then export the app for the serverless function.
  initializeDatabase().catch((err) => console.error('DB Init Error:', err));
  module.exports = app;
} else {
  // Local development or standard VPS hosting
  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`✅ IMXX Server running on http://localhost:${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   CORS origin: ${CLIENT_ORIGIN}`);
      });
    })
    .catch((err) => {
      console.error('[FATAL] Database initialization failed:', err);
      process.exit(1);
    });
}
