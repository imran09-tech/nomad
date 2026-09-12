const fs = require('fs');

const raw = fs.readFileSync('authRoutes.raw.js', 'utf8');
const modified = raw.replace(/app\.(post|get|put|delete)\('\/api\/auth\//g, "router.$1('/");

const prefix = `const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dbGet, dbRun } = require('../config/database');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const { validate, schemas } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET;
let mailer;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function sanitize(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\\//g, '&#x2F;');
}

`;

const postfix = `\nmodule.exports = router;\n`;

fs.writeFileSync('server/routes/authRoutes.js', prefix + modified + postfix);
console.log('authRoutes.js created!');
