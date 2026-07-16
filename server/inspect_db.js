require('dotenv').config();
const db = require('./db');

async function inspect() {
  try {
    console.log('Discovering tables in public schema...');
    const tables = await db('information_schema.tables')
      .select('table_name')
      .where({ table_schema: 'public' })
      .orderBy('table_name');

    for (const row of tables) {
      const table = row.table_name;
      try {
        const c = await db(table).count('* as count').first();
        console.log(`\nTable: ${table} — rows: ${c.count}`);

        // show up to 5 sample rows for obvious tables
        if (['users', 'students', 'classes', 'announcements', 'grades'].includes(table)) {
          const samples = await db.select('*').from(table).limit(5);
          console.log(JSON.stringify(samples, null, 2));
        }
      } catch (e) {
        console.error(`  (skipping ${table}: ${e.message})`);
      }
    }
  } catch (err) {
    console.error('Error inspecting database:', err.message);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

inspect();
