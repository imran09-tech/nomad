/**
 * /src/middleware/validate.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Zod-based request validation middleware.
 * Usage: router.post('/path', validate(myZodSchema), handler)
 *
 * Returns 400 { success:false, message:..., details:[...] } on invalid input.
 * Strips unknown keys by default (protects against mass-assignment / injection).
 * ─────────────────────────────────────────────────────────────────────────────
 */
const { z } = require('zod');

// ── Shared reusable field definitions ────────────────────────────────────────

const emailField = z
  .string({ required_error: 'Email is required' })
  .email('Must be a valid email address')
  .max(254, 'Email too long')
  .transform(v => v.toLowerCase().trim());

const passwordField = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long');

const safeStringField = (label, maxLen = 200) =>
  z
    .string({ required_error: `${label} is required` })
    .min(1, `${label} cannot be blank`)
    .max(maxLen, `${label} must be under ${maxLen} characters`)
    .transform(v => v.trim());

// ── Exported Zod schemas ─────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
const registerSchema = z.object({
  email:       emailField,
  password:    passwordField,
  fullName:    safeStringField('Full name', 100),
  username:    z.string().min(3, 'Username must be at least 3 characters').max(40).regex(/^[a-zA-Z0-9_.-]+$/, 'Username may only contain letters, numbers, _ . -').transform(v => v.trim()),
  phoneNumber: z.string().max(20).optional().transform(v => v?.replace(/[^\d+\-\s()]/g, '').trim()),
});

/**
 * POST /api/auth/signup-request
 */
const signupRequestSchema = z.object({
  email:       emailField,
  password:    passwordField,
  fullName:    safeStringField('Full name', 100),
  username:    z.string().min(3, 'Username must be at least 3 characters').max(40).regex(/^[a-zA-Z0-9_.-]+$/, 'Username may only contain letters, numbers, _ . -').transform(v => v.trim()),
  phoneNumber: z.string().max(20).optional().transform(v => v?.replace(/[^\d+\-\s()]/g, '').trim()),
});

/**
 * POST /api/auth/signup-verify
 */
const signupVerifySchema = z.object({
  email:        emailField,
  code:         z.string().length(6, 'Code must be exactly 6 digits').regex(/^\d{6}$/),
});


/**
 * POST /api/auth/login
 */
const loginSchema = z.object({
  email:    z.string().min(1, 'Email/username is required').max(254).transform(v => v.trim()),
  password: z.string().min(1, 'Password is required').max(128),
});

/**
 * POST /api/auth/forgot-password
 */
const forgotPasswordSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required').max(254).transform(v => v.trim()),
});

/**
 * POST /api/auth/verify-reset-code
 */
const verifyResetCodeSchema = z.object({
  emailOrPhone: z.string().min(1).max(254).transform(v => v.trim()),
  code:         z.string().length(6, 'Code must be exactly 6 digits').regex(/^\d{6}$/),
});

/**
 * POST /api/auth/reset-password
 */
const resetPasswordSchema = z.object({
  emailOrPhone: z.string().min(1).max(254).transform(v => v.trim()),
  code:         z.string().length(6).regex(/^\d{6}$/),
  newPassword:  passwordField,
});

/**
 * PUT /api/user/profile
 */
const updateProfileSchema = z.object({
  fullName:    safeStringField('Full name', 100),
  username:    z.string().min(3).max(40).regex(/^[a-zA-Z0-9_.-]+$/).transform(v => v.trim()),
  email:       emailField,
  currency:    z.enum(['USD', 'EUR', 'INR', 'GBP', 'AED']).default('USD'),
  phoneNumber: z.string().max(20).optional().transform(v => v?.replace(/[^\d+\-\s()]/g, '').trim()),
});

/**
 * POST /api/bookings  (booking creation/capture)
 */
const createBookingSchema = z.object({
  itemName:        safeStringField('Item name', 300),
  totalPrice:      z.string().or(z.number()).transform(v => String(v)),
  paymentIntentId: z.string().max(100).optional(),
  utr:             z.string().regex(/^\d{12}$/, 'UTR must be exactly 12 digits').optional(),
  destinationId:   z.number().int().positive().optional(),
  checkIn:         z.string().optional(),
  checkOut:        z.string().optional(),
  guests:          z.number().int().min(1).max(50).optional(),
}).refine(d => d.paymentIntentId || d.utr, {
  message: 'Either paymentIntentId or UTR is required',
  path: ['paymentIntentId'],
});

/**
 * POST /api/create-payment-intent — Step 6 of wizard
 * NOTE: We intentionally do NOT accept a totalPrice from the client.
 * Instead the client sends only destinationId + dates + guests; the server
 * recomputes the price from the DB. This schema enforces that contract.
 */
const createPaymentIntentSchema = z.object({
  destinationId: z.number({ required_error: 'destinationId is required' }).int().positive(),
  checkIn:       z.string({ required_error: 'checkIn date is required' })
                  .refine(d => !isNaN(Date.parse(d)), 'Invalid checkIn date'),
  checkOut:      z.string({ required_error: 'checkOut date is required' })
                  .refine(d => !isNaN(Date.parse(d)), 'Invalid checkOut date'),
  guests:        z.number().int().min(1).max(50).default(1),
  // Optional: addons selected by user
  addons:        z.array(z.enum(['flight', 'food_bundle', 'events'])).default([]),
});

/**
 * Step 4: Guest information (sent from wizard Step 4)
 */
const guestInfoSchema = z.object({
  fullName:  safeStringField('Full name', 100),
  email:     emailField,
  phone:     z.string().max(20).optional().transform(v => v?.replace(/[^\d+\-\s()]/g, '').trim()),
  address:   safeStringField('Address', 300).optional(),
  country:   safeStringField('Country', 100).optional(),
  specialRequests: z.string().max(1000).optional().transform(v => v?.trim()),
});

/**
 * POST /api/feedback
 */
const feedbackSchema = z.object({
  category: z.enum(['booking', 'service', 'platform', 'other'], {
    required_error: 'Category must be one of: booking, service, platform, other',
  }),
  rating:  z.number().int().min(1).max(5),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

// ── Middleware factory ────────────────────────────────────────────────────────

/**
 * validate(schema, source?)
 * @param {z.ZodSchema} schema   – Zod schema to validate against
 * @param {'body'|'query'|'params'} [source='body']
 *
 * On success: replaces req[source] with the parsed (and stripped) value.
 * On failure: calls next(err) with statusCode 400.
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.errors.map(e => ({
        field:   e.path.join('.'),
        message: e.message,
      }));
      const err = new Error('Validation failed');
      err.statusCode = 400;
      err.details    = details;
      return next(err);
    }
    // Replace with cleaned/transformed data (strips unknown keys)
    req[source] = result.data;
    next();
  };
};

module.exports = {
  validate,
  schemas: {
    register:            registerSchema,
    signupRequest:       signupRequestSchema,
    signupVerify:        signupVerifySchema,
    login:               loginSchema,
    forgotPassword:      forgotPasswordSchema,
    verifyResetCode:     verifyResetCodeSchema,
    resetPassword:       resetPasswordSchema,
    updateProfile:       updateProfileSchema,
    createBooking:       createBookingSchema,
    createPaymentIntent: createPaymentIntentSchema,
    guestInfo:           guestInfoSchema,
    feedback:            feedbackSchema,
  },
};
