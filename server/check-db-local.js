const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../nomad.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, name, type, image, category FROM destinations WHERE type='forest'", (err, rows) => {
  if (err) {
    console.error("Error reading database:", err);
  } else {
    console.log(`Total forest records: ${rows.length}`);
    if (rows.length > 0) {
      console.log("First 3 records:");
      console.log(rows.slice(0, 3));
      console.log("Last 3 records:");
      console.log(rows.slice(-3));
    }
  }
  db.close();
});
