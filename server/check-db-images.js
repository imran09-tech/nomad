const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '../nomad.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, name, type, image, category FROM destinations", (err, rows) => {
  if (err) {
    console.error("Error reading database:", err);
    process.exit(1);
  }

  console.log(`Checking ${rows.length} destination records...`);
  const missing = [];
  const valid = [];

  rows.forEach(r => {
    if (!r.image) return;
    // Ignore absolute URLs
    if (r.image.startsWith('http://') || r.image.startsWith('https://') || r.image.startsWith('//')) {
      return;
    }

    const fullPath = path.resolve(__dirname, '..', r.image);
    if (!fs.existsSync(fullPath)) {
      missing.push({ id: r.id, name: r.name, type: r.type, image: r.image, fullPath });
    } else {
      valid.push(r.image);
    }
  });

  console.log(`Verified ${valid.length + missing.length} local images in the database.`);
  if (missing.length > 0) {
    console.log(`Found ${missing.length} missing/broken image paths in the database:`);
    missing.forEach(m => {
      console.log(` - ID ${m.id} | ${m.name} (${m.type}) | Image: ${m.image}`);
    });
  } else {
    console.log("SUCCESS: All local images in the database exist on disk!");
  }

  db.close();
});
