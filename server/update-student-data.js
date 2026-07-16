require('dotenv').config();
const db = require('./db');

async function updateStudentData() {
  try {
    console.log('Updating student data with profile information...');
    
    const updated = await db('students')
      .where({ id: 'BPS-2451' })
      .update({
        class: 'Form 4A',
        stream: 'Sciences',
        gender: 'M',
        date_of_birth: '2008-03-12',
        blood_group: 'O+',
        address: '45 Borrowdale Rd, Harare',
        email: 'tatenda.moyo@schoolmanagement.edu',
        phone: '+263 77 333 4455',
        guardian_name: 'Mrs. Norma Ndlovu',
        guardian_email: 'n.ndlovu@gmail.com',
        guardian_phone: '+263 77 555 6666',
        current_gpa: 3.4,
      });

    if (updated) {
      console.log('Student record updated successfully');
    } else {
      console.log('Student not found, creating new record...');
      await db('students').insert({
        id: 'BPS-2451',
        name: 'Tatenda Moyo',
        class: 'Form 4A',
        stream: 'Sciences',
        gender: 'M',
        date_of_birth: '2008-03-12',
        blood_group: 'O+',
        address: '45 Borrowdale Rd, Harare',
        status: 'Active',
        email: 'tatenda.moyo@schoolmanagement.edu',
        phone: '+263 77 333 4455',
        guardian_name: 'Mrs. Norma Ndlovu',
        guardian_email: 'n.ndlovu@gmail.com',
        guardian_phone: '+263 77 555 6666',
        current_gpa: 3.4,
      });
      console.log('Student record created successfully');
    }

    // Verify the update
    const student = await db('students').where({ id: 'BPS-2451' }).first();
    console.log('Updated student:', student);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateStudentData();
