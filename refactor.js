const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const startMarker = "// Request Signup via Email OTP";
const endMarker = "// Update Profile";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    let actualStart = code.lastIndexOf('\n', startIndex);
    let actualEnd = code.lastIndexOf('\n', code.lastIndexOf('\n', endIndex) - 1);
    
    const chunk = code.substring(actualStart, actualEnd);
    fs.writeFileSync('authRoutes.raw.js', chunk);
    
    const replacement = `\n// ─── Auth Module ─────────────────────────────\napp.use('/api/auth', require('./routes/authRoutes'));\n\n`;
    code = code.substring(0, actualStart) + replacement + code.substring(actualEnd);
    
    fs.writeFileSync('server/index.js', code);
    console.log("Successfully extracted Auth routes!");
} else {
    console.error("Could not find markers!");
}
