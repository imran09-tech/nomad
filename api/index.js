// This is the ONLY file Vercel will treat as a Serverless Function.
// It proxies all API requests to the monolithic Express backend in /server.
const app = require('../server/index.js');
module.exports = app;
