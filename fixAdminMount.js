const fs = require('fs');

let indexCode = fs.readFileSync('server/index.js', 'utf8');
indexCode = indexCode.replace(/(\/\/ ─── Bookings & Payments Module ─────────────────────────────)/, "// ─── Admin Module ─────────────────────────────\napp.use('/api/admin', require('./routes/adminRoutes'));\n\n$1");
fs.writeFileSync('server/index.js', indexCode);
console.log('Restored admin mount to index.js');

let bookingCode = fs.readFileSync('server/routes/bookingRoutes.js', 'utf8');
bookingCode = bookingCode.replace(/app\.use\('\/api\/admin', require\('\.\/routes\/adminRoutes'\)\);\n/g, '');
bookingCode = bookingCode.replace(/\/\/ ─── Admin Module ─────────────────────────────\n/g, '');
fs.writeFileSync('server/routes/bookingRoutes.js', bookingCode);
console.log('Removed admin mount from bookingRoutes.js');
