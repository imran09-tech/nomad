
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