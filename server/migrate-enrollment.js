require('dotenv').config();
const db = require('./db');

async function migrate() {
  try {
    console.log('Running migration for student enrollment system...');

    // Add subject_code column to classes table
    console.log('Adding subject_code column to classes...');
    try {
      await db.raw(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS subject_code VARCHAR(20)`);
    } catch (error) {
      console.log('Subject code column may already exist');
    }

    // Create student_classes table
    console.log('Creating student_classes table...');
    try {
      await db.raw(`
        CREATE TABLE IF NOT EXISTS student_classes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
          class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
          enrolled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(student_id, class_id)
        )
      `);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('student_classes table already exists');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
}

migrate();
