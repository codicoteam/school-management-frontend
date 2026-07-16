const db = require('../db');

async function up() {
  try {
    await db.raw("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'general';");
    console.log('Migration applied: announcements.type added');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

up();
