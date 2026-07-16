require('dotenv').config();
const db = require('./db');

async function seedEnrollments() {
  try {
    console.log('Seeding student enrollments and subject codes...');

    // First, get or create classes with subject codes
    const subjects = [
      { name: 'Mathematics', code: 'MATH01', subject: 'Mathematics' },
      { name: 'English', code: 'ENG401', subject: 'English' },
      { name: 'Combined Science', code: 'SCI401', subject: 'Science' },
      { name: 'History', code: 'HIS401', subject: 'History' },
      { name: 'Geography', code: 'GEO401', subject: 'Geography' },
      { name: 'Religious Studies', code: 'REL401', subject: 'Religious Studies' },
      { name: 'Physical Education', code: 'PE401', subject: 'Physical Education' },
      { name: 'Shona', code: 'SHO401', subject: 'Shona' },
    ];

    const teacherUser = await db('users').where({ email: 'teacher@example.com' }).first();
    const studentId = 'BPS-2451';

    if (!teacherUser) {
      console.log('Teacher user not found');
      process.exit(1);
    }

    // Create or update classes with subject codes
    for (const subj of subjects) {
      let classRecord = await db('classes').where({ subject: subj.subject }).first();
      
      if (!classRecord) {
        console.log(`Creating class: ${subj.name}`);
        const [newClass] = await db('classes')
          .insert({
            teacher_id: teacherUser.id,
            name: subj.name,
            subject: subj.subject,
            subject_code: subj.code,
            grade: 'Form 4',
          })
          .returning('*');
        classRecord = newClass;
      } else {
        // Update subject code if not present
        if (!classRecord.subject_code) {
          console.log(`Updating class ${classRecord.id} with subject code ${subj.code}`);
          await db('classes')
            .where({ id: classRecord.id })
            .update({ subject_code: subj.code });
        }
      }

      // Enroll student in this class
      const existing = await db('student_classes')
        .where({ student_id: studentId, class_id: classRecord.id })
        .first();

      if (!existing) {
        console.log(`Enrolling student ${studentId} in ${subj.name}`);
        await db('student_classes').insert({
          student_id: studentId,
          class_id: classRecord.id,
        });
      }
    }

    console.log('Enrollment seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedEnrollments();
