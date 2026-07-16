require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function run() {
  const [email, password, role = 'admin'] = process.argv.slice(2);
  if (!email || !password) {
    console.log('Usage: node create_user.js <email> <password> [role]');
    process.exit(1);
  }

  try {
    const existing = await db('users').where({ email }).first();
    if (existing) {
      console.log('User already exists:');
      console.log({ id: existing.id, email: existing.email, role: existing.role, name: existing.name });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const now = new Date();
    await db('users').insert({ id, email, password: hashed, name: 'Imported Admin', role, created_at: now });
    console.log('Created user', email, 'role:', role);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

run();
