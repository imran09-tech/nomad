const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../nomad.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

db.all('SELECT * FROM bookings ORDER BY created_at DESC', [], (err, rows) => {
  if (err) {
    console.error('Error querying bookings:', err);
    process.exit(1);
  }

  console.log(`Bookings in database count: ${rows.length}`);
  rows.forEach((row, idx) => {
    console.log(`Booking ${idx}: ID=${row.id}, UserID=${row.user_id}, ItemName="${row.item_name}", Price="${row.total_price}", UTR="${row.utr}", Status="${row.status}", CreatedAt="${row.created_at}"`);
  });
  db.close();
});
