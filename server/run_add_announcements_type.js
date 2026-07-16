require('dotenv').config();
const db = require('./db');

async function run() {
  try {
    await db.raw("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'general';");
    console.log('Migration applied: announcements.type added');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

run();
