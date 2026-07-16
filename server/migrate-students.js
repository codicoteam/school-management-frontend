require('dotenv').config();
const db = require('./db');

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to students table if they don\'t exist...');
    
    const alters = [
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS stream VARCHAR(100)`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5)`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS address VARCHAR(255)`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(255)`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_email VARCHAR(255)`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_phone VARCHAR(20)`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS current_gpa NUMERIC(3,2)`,
    ];

    for (const sql of alters) {
      try {
        await db.raw(sql);
        console.log('Executed:', sql.substring(0, 60) + '...');
      } catch (error) {
        console.log('Skipped:', sql.substring(0, 60) + '... (may already exist)');
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addMissingColumns();
