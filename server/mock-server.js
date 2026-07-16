const { createApp } = require('./server');

// Lightweight mock DB similar to tests for manual local dev
function createMockDb() {
  const users = [];
  const students = [];
  const grades = [];
  const student_classes = [];
  const exams = [];

  function table(name) {
    const rows = { users, students, grades, student_classes, exams }[name];
    function makeQb(filtered) {
      let _filtered = filtered || rows;
      let avgCalled = false;
      return {
        where: function (conds) {
          const res = _filtered.filter(r => Object.keys(conds).every(k => r[k] === conds[k]));
          return makeQb(res);
        },
        first: async () => _filtered[0] || undefined,
        count: async () => ({ count: _filtered.length }),
        select: function () { return this; },
        orderBy: function () { return this; },
        insert: async function (payload) { if (Array.isArray(payload)) payload.forEach(p => rows.push(p)); else rows.push(payload); return [payload]; },
        del: async () => 0,
        join: function () { return this; },
        avg: function () { avgCalled = true; return this; },
        groupBy: function () { return this; },
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
          return Promise.resolve(_filtered).then(resolve);
        }
      };
    }
    const api = makeQb();
    api.insert = async function (payload) { if (Array.isArray(payload)) payload.forEach(p => rows.push(p)); else rows.push(payload); return [payload]; };
    api.select = async function () { return rows; };
    return api;
  }

  return table;
}

const mockDb = createMockDb();
// seed
mockDb('students').insert({ id: 'BPS-2451', name: 'Tatenda', class: 'Form 4A' });
mockDb('users').insert({ id: 'u1', email: 'student@example.com', password: 'x', name: 'Jane', role: 'student' });
mockDb('grades').insert({ id: 'g1', student_id: 'BPS-2451', subject: 'Mathematics', exam_name: 'Term 1', score: 78, grade: 'A', created_at: new Date() });
mockDb('student_classes').insert({ id: 'sc1', student_id: 'BPS-2451', class_id: 'class1' });
mockDb('exams').insert({ id: 'e1', class_id: 'class1', name: 'Math Midterm', date: new Date() });

const app = createApp(mockDb);

const PORT = process.env.MOCK_PORT || 4001;
app.listen(PORT, () => console.log(`Mock server running on port ${PORT}`));

module.exports = app;
