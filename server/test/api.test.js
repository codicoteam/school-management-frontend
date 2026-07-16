const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const { createApp } = require('../server');

// create a fake in-memory db using simple arrays and functions
function createMockDb() {
  const users = [];
  const students = [];
  const grades = [];
  const student_classes = [];
  const exams = [];
  const attendance = [];
  const library_items = [];
  const bookmarks = [];
  const borrowings = [];
  const announcements = [];
  const fees = [];
  const documents = [];
  const messages = [];

  function table(name) {
    const rows = { users, students, grades, student_classes, exams, attendance, library_items, bookmarks, borrowings, announcements, fees, documents, messages }[name];

    function makeQb(filtered) {
      let _filtered = filtered || rows;
      let avgCalled = false;
      let countCalled = false;
      return {
        where: function (conds) {
          if (typeof conds === 'function') {
            conds.call(this);
            return this;
          }
          const res = _filtered.filter(r => Object.keys(conds).every(k => r[k] === conds[k]));
          _filtered = res;
          return this;
        },
        orWhere: function (conds) {
          const orRows = rows.filter(r => Object.keys(conds).every(k => r[k] === conds[k]));
          const union = _filtered.concat(orRows.filter(r => !_filtered.includes(r)));
          _filtered = union;
          return this;
        },
        first: async () => {
          if (countCalled) {
            return { cnt: _filtered.length };
          }
          return _filtered[0] || undefined;
        },
        count: function () {
          countCalled = true;
          return this;
        },
        select: function () { return this; },
        orderBy: function () { return this; },
        insert: function (payload) {
          if (Array.isArray(payload)) payload.forEach(p => rows.push(p)); else rows.push(payload);
          const result = Array.isArray(payload) ? payload : [payload];
          const promiseResult = Promise.resolve(result);
          return {
            returning: async function () {
              return result;
            },
            then: promiseResult.then.bind(promiseResult),
          };
        },
        del: async () => 0,
        join: function () { return this; },
        avg: function () { avgCalled = true; return this; },
        groupBy: function () { return this; },
        countDistinct: function () { return this; },
        then: function (resolve) {
          if (avgCalled) {
            const map = {};
            _filtered.forEach(r => {
              const key = r.exam_name || 'all';
              map[key] = map[key] || { sum: 0, n: 0 };
              map[key].sum += Number(r.score || 0);
              map[key].n += 1;
            });
            const out = Object.keys(map).map(k => ({ exam_name: k, avg_score: map[k].sum / map[k].n }));
            return Promise.resolve(out).then(resolve);
          }
          if (countCalled) {
            return Promise.resolve({ cnt: _filtered.length }).then(resolve);
          }
          return Promise.resolve(_filtered).then(resolve);
        }
      };
    }

    const api = makeQb();
    api.insert = function (payload) {
      if (Array.isArray(payload)) payload.forEach(p => rows.push(p)); else rows.push(payload);
      const result = Array.isArray(payload) ? payload : [payload];
      const promiseResult = Promise.resolve(result);
      return {
        returning: async function () {
          return result;
        },
        then: promiseResult.then.bind(promiseResult),
      };
    };
    api.select = function () { return this; };
    return api;
  }

  return table;
}

describe('API routes', () => {
  let app, mockDb;

  before(async () => {
    mockDb = createMockDb();
    app = createApp(mockDb);
    // seed some mock data
    await mockDb('students').insert({ id: 'BPS-2451', name: 'Tatenda', class: 'Form 4A', guardian_email: 'parent@example.com', guardian_user_id: 'p1' });
    await mockDb('users').insert({ id: 'u1', email: 'student@example.com', password: '$2a$10$ABCDEFG', name: 'Jane', role: 'student' });
    await mockDb('users').insert({ id: 'p1', email: 'parent@example.com', password: '$2a$10$ABCDEFG', name: 'Mrs. Ndlovu', role: 'parent' });
    await mockDb('grades').insert({ id: 'g1', student_id: 'BPS-2451', subject: 'Mathematics', exam_name: 'Term 1', score: 78, grade: 'A', created_at: new Date() });
    await mockDb('student_classes').insert({ id: 'sc1', student_id: 'BPS-2451', class_id: 'class1' });
    await mockDb('exams').insert({ id: 'e1', class_id: 'class1', name: 'Math Midterm', date: new Date() });
    await mockDb('attendance').insert({ id: 'a1', class_id: 'class1', student_id: 'BPS-2451', teacher_id: 'u1', date: '2025-04-20', status: 'present' });
    await mockDb('attendance').insert({ id: 'a2', class_id: 'class1', student_id: 'BPS-2451', teacher_id: 'u1', date: '2025-04-19', status: 'absent' });
    await mockDb('attendance').insert({ id: 'a3', class_id: 'class1', student_id: 'BPS-2451', teacher_id: 'u1', date: '2025-04-18', status: 'late' });
    await mockDb('fees').insert({ id: 'f1', student_id: 'BPS-2451', amount: 760.0, item: 'Term 1 — Full', method: 'Bank Transfer', due_date: '2025-04-30', status: 'Paid' });
    await mockDb('library_items').insert({ id: 'li1', title: 'Quantum Physics for Beginners', author: 'Jason Stephenson', subject: 'Science', digital_url: 'http://example.com/quantum' });
    await mockDb('documents').insert({ id: 'd1', student_id: 'BPS-2451', name: 'Term 1 2025 Report Card', type: 'Report Card', size: '320 KB', url: '/docs/term1-2025-report-card.pdf', created_at: new Date() });
    await mockDb('messages').insert({ id: 'm1', sender_id: 'teacher-1', sender_name: 'Mr. Mhlanga', receiver_id: 'p1', receiver_name: 'Mrs. Ndlovu', subject: 'Attendance follow-up', text: 'Please sign the permission slip.', is_new: true, created_at: new Date() });
  });

  it('returns student data with valid auth', async () => {
    // create a fake token by signing with the same secret
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'u1', email: 'student@example.com', role: 'student' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).get('/api/students/BPS-2451').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('id', 'BPS-2451');
  });

  it('returns student results', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'u1', email: 'student@example.com', role: 'student' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).get('/api/students/BPS-2451/results').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0]).to.have.property('subject', 'Mathematics');
  });

  it('returns exams and upcoming', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'u1', email: 'student@example.com', role: 'student' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).get('/api/students/BPS-2451/exams').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('exams');
    expect(res.body).to.have.property('upcoming');
  });

  it('returns grades trend', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'u1', email: 'student@example.com', role: 'student' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).get('/api/students/BPS-2451/grades/trend').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('returns report', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'u1', email: 'student@example.com', role: 'student' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).get('/api/students/BPS-2451/report').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('student');
    expect(res.body).to.have.property('grades');
  });

  it('returns attendance history for student', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'u1', email: 'student@example.com', role: 'student' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).get('/api/students/BPS-2451/attendance').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.equal(3);
  });

  it('returns parent children list', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'p1', email: 'parent@example.com', role: 'parent' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).get('/api/parents/p1/children').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0]).to.have.property('id', 'BPS-2451');
  });

  it('returns fee history for a student', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'p1', email: 'parent@example.com', role: 'parent' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).get('/api/fees/BPS-2451').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0]).to.have.property('student_id', 'BPS-2451');
    expect(res.body[0]).to.have.property('item');
    expect(res.body[0]).to.have.property('method');
  });

  it('returns student documents for a parent', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'p1', email: 'parent@example.com', role: 'parent' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).get('/api/documents').query({ studentId: 'BPS-2451' }).set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0]).to.have.property('name', 'Term 1 2025 Report Card');
  });

  it('returns messages for a parent', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'p1', email: 'parent@example.com', role: 'parent' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).get('/api/messages').query({ userId: 'p1' }).set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0]).to.have.property('receiver_id', 'p1');
  });

  it('creates a new message', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'p1', email: 'parent@example.com', role: 'parent', name: 'Mrs. Ndlovu' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).post('/api/messages').send({
      receiverId: 'teacher-1',
      receiverName: 'Mr. Mhlanga',
      subject: 'Follow up',
      text: 'Can I get an update on homework?',
    }).set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('sender_name', 'Mrs. Ndlovu');
    expect(res.body).to.have.property('receiver_id', 'teacher-1');
  });

  it('creates a new fee payment record', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'p1', email: 'parent@example.com', role: 'parent' }, process.env.JWT_SECRET || 'your-secret-key');

    const payment = {
      student_id: 'BPS-2451',
      amount: 120.0,
      item: 'Term 2 — Partial',
      method: 'EcoCash',
      due_date: '2025-05-15',
      paid_date: '2025-05-15',
      status: 'Paid',
    };

    const res = await request(app).post('/api/fees').send(payment).set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(201);
    expect(res.body).to.include({ student_id: 'BPS-2451', amount: 120.0, item: 'Term 2 — Partial', method: 'EcoCash', status: 'Paid' });
  });

  it('returns library list and search', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'u1', email: 'student@example.com', role: 'student' }, process.env.JWT_SECRET || 'your-secret-key');

    const res = await request(app).get('/api/library').set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');

    const res2 = await request(app).get('/api/library').query({ q: 'quantum' }).set('Authorization', `Bearer ${token}`);
    expect(res2.status).to.equal(200);
    expect(res2.body.length).to.be.greaterThan(0);
  });
});
