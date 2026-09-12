const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const startMarker = "//  FEEDBACK ROUTES";
const endMarker = "//  GLOBAL ERROR HANDLER";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    let actualStart = code.lastIndexOf('\n', startIndex) - 40; // going back above the dashed line
    actualStart = code.lastIndexOf('// ─────────────────────────────────────────────', startIndex) - 1;
    let actualEnd = code.lastIndexOf('// ─────────────────────────────────────────────', endIndex) - 1;

    let chunk = code.substring(actualStart, actualEnd);
    
    // Replace app.method( with router.method(
    chunk = chunk.replace(/app\.(post|get|put|delete)/g, 'router.$1');
    // Replace '/api/feedback' with '/feedback'
    chunk = chunk.replace(/\/api\/feedback/g, '/feedback');
    // Replace '/api/chat' with '/chat'
    chunk = chunk.replace(/\/api\/chat/g, '/chat');

    const prefix = `const express = require('express');
const router = express.Router();
const { dbGet, dbRun, dbAll } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

`;

    const postfix = `\nmodule.exports = router;\n`;

    fs.writeFileSync('server/routes/feedbackRoutes.js', prefix + chunk + postfix);
    
    const replacement = `\n// ─── Feedback & Chat Module ─────────────────────────────\napp.use('/api', require('./routes/feedbackRoutes'));\n\n`;
    
    code = code.substring(0, actualStart) + replacement + code.substring(actualEnd);
    
    fs.writeFileSync('server/index.js', code);
    console.log("Successfully extracted Feedback routes!");
} else {
    console.error("Could not find markers!");
}
