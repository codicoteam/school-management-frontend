require('dotenv').config();
const db = require('./db');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

// Split by semicolons and execute each statement
const statements = schemaSQL.split(';').filter(s => s.trim());

async function applySchema() {
  try {
    console.log('Applying schema...');
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await db.raw(statement);
      }
    }
    console.log('Schema applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error applying schema:', error.message);
    process.exit(1);
  }
}

applySchema();
