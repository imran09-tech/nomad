const { dbRun, initializeDatabase, db } = require('../src/config/database');

async function reset() {
  console.log("Dropping destinations table...");
  await dbRun("DROP TABLE IF EXISTS destinations");
  console.log("Re-initializing database...");
  await initializeDatabase();
  console.log("Database reset complete.");
  db.close();
}

reset().catch(console.error);
