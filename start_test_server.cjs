const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true,
});
const bcrypt = require('bcryptjs');
const { createApp } = require('./server/server.js');

(async () => {
  try {
    const hasUsers = await knex.schema.hasTable('users');
    if (!hasUsers) {
      await knex.schema.createTable('users', (t) => {
        t.string('id').primary();
        t.string('email').unique();
        t.string('password');
        t.string('name');
        t.string('role');
      });
    }

    const hasClasses = await knex.schema.hasTable('classes');
    if (!hasClasses) {
      await knex.schema.createTable('classes', (t) => {
        t.string('id').primary();
        t.string('name');
        t.string('subject');
      });
    }

    const email = 'h200258v@hit.ac.zw';
    const plain = 'rady1441';
    const existing = await knex('users').where({ email }).first();
    if (!existing) {
      const hashed = await bcrypt.hash(plain, 10);
      await knex('users').insert({ id: 'admin-1', email, password: hashed, name: 'Admin Test', role: 'admin' });
      console.log('Seeded admin user');
    }

    const cls = await knex('classes').where({ id: 'c1' }).first();
    if (!cls) {
      await knex('classes').insert({ id: 'c1', name: 'Form 1A', subject: 'Mathematics' });
      console.log('Seeded classes');
    }

    const app = createApp(knex);
    const PORT = 3002;
    app.listen(PORT, () => console.log(`In-memory test server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start test server', err);
    process.exit(1);
  }
})();
