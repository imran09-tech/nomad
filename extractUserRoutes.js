const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const startMarker = "// Update Profile";
const endMarker = "// DELETE /api/destinations/:id/video - Delete video from database & disk";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    let actualStart = code.lastIndexOf('\n', startIndex);
    let actualEnd = code.lastIndexOf('\n', code.lastIndexOf('\n', endIndex) - 1);
    
    let chunk = code.substring(actualStart, actualEnd);
    
    // Replace app.method( with router.method(
    chunk = chunk.replace(/app\.(post|get|put|delete)/g, 'router.$1');
    // Replace '/api/users/something' with '/something'
    chunk = chunk.replace(/\/api\/users\//g, '/');
    // Replace '/api/users' with '/'
    chunk = chunk.replace(/'\/api\/users'/g, '\'/\'');
    chunk = chunk.replace(/"\/api\/users"/g, '"/"');

    const prefix = `const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { dbGet, dbRun } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const s3Client = require('../config/s3Client'); // Assuming it's in config or we just don't import it if unused

// Setup multer for avatar uploads
const upload = multer({ dest: path.join(__dirname, '../../public/assets/uploads/') });

`;

    const postfix = `\nmodule.exports = router;\n`;

    fs.writeFileSync('server/routes/userRoutes.js', prefix + chunk + postfix);
    
    const replacement = `\n// ─── User Module ─────────────────────────────\napp.use('/api/users', require('./routes/userRoutes'));\n\n`;
    code = code.substring(0, actualStart) + replacement + code.substring(actualEnd);
    
    fs.writeFileSync('server/index.js', code);
    console.log("Successfully extracted User routes!");
} else {
    console.error("Could not find markers!");
}
