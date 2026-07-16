require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const swaggerUi = require('swagger-ui-express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function createApp(db) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
      cb(null, `${uniqueSuffix}-${safeName}`);
    },
  });

  const upload = multer({ storage });
  app.use('/uploads', express.static(uploadsDir));

  app.get('/', (req, res) => {
    res.send({
      status: 'ok',
      message: 'School Management API backend is deployed successfully.',
      docs: '/api-docs',
      swaggerJson: '/api-docs.json',
    });
  });

  const swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'School Management API',
      version: '1.0.0',
      description: 'Complete backend API documentation for the school management system',
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Local development server' },
      { url: 'https://school-management-app-v2.onrender.com', description: 'Production server' }
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication and management' },
      { name: 'Students', description: 'Student information and management' },
      { name: 'Teachers', description: 'Teacher information and management' },
      { name: 'Classes', description: 'Class and course management' },
      { name: 'Attendance', description: 'Attendance tracking and records' },
      { name: 'Grades & Results', description: 'Grades, exam results and academic performance' },
      { name: 'Assignments', description: 'Assignment management and tracking' },
      { name: 'Exams', description: 'Exam scheduling and management' },
      { name: 'Timetable', description: 'Class timetable and schedule' },
      { name: 'Announcements', description: 'School announcements and notifications' },
      { name: 'Messaging', description: 'Internal messaging system' },
      { name: 'Library', description: 'Library resources and borrowing system' },
      { name: 'Fees & Payments', description: 'Fee management and payment tracking' },
      { name: 'Resources', description: 'Educational resources and materials' },
      { name: 'Inventory', description: 'School inventory management' },
      { name: 'Applications', description: 'Student applications and admissions' },
      { name: 'Documents', description: 'Student documents and records' },
      { name: 'Calendar', description: 'School calendar and events' },
      { name: 'Parents', description: 'Parent information and management' },
      { name: 'Administration', description: 'System administration, settings, and auditing' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        AuthRequest: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: { type: 'string', example: 'teacher@example.com' },
            password: { type: 'string', example: 'password123' },
            role: { type: 'string', example: 'teacher' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            subject: { type: 'string', nullable: true },
            grade: { type: 'string', nullable: true },
            classes: { type: ['array', 'null'], items: { type: 'string' } },
            status: { type: ['string', 'null'] },
            qualification: { type: ['string', 'null'] },
          },
        },
        Student: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            class: { type: 'string' },
            stream: { type: 'string' },
            gender: { type: 'string' },
            date_of_birth: { type: 'string' },
            blood_group: { type: 'string' },
            address: { type: 'string' },
            status: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            guardian_name: { type: 'string' },
            guardian_email: { type: 'string' },
            guardian_phone: { type: 'string' },
            guardian_user_id: { type: 'string' },
            current_gpa: { type: 'number' },
          },
        },
        Class: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            teacher_id: { type: 'string' },
            name: { type: 'string' },
            subject: { type: 'string' },
            subject_code: { type: 'string' },
            grade: { type: 'string' },
          },
        },
        Assignment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            class_id: { type: 'string' },
            teacher_id: { type: 'string' },
            title: { type: 'string' },
            subject: { type: 'string' },
            description: { type: 'string' },
            due_date: { type: 'string' },
          },
        },
        Exam: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            class_id: { type: 'string' },
            teacher_id: { type: 'string' },
            name: { type: 'string' },
            subject: { type: 'string' },
            date: { type: 'string' },
            total_marks: { type: 'number', nullable: true },
          },
        },
        Grade: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            student_id: { type: 'string' },
            subject: { type: 'string' },
            exam_name: { type: 'string' },
            score: { type: 'number' },
            grade: { type: 'string' },
          },
        },
        Subject: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            teachersCount: { type: 'integer' },
            classesCount: { type: 'integer' },
          },
        },
        TeacherStats: {
          type: 'object',
          properties: {
            totalTeachers: { type: 'integer' },
            activeToday: { type: 'integer' },
            totalSubjects: { type: 'integer' },
            sickLeaves: { type: 'integer' },
          },
        },
        Announcement: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            created_by: { type: 'string' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            sender_id: { type: 'string' },
            sender_name: { type: 'string' },
            receiver_id: { type: 'string' },
            receiver_name: { type: 'string' },
            subject: { type: 'string' },
            text: { type: 'string' },
            is_new: { type: 'boolean' },
          },
        },
        Fee: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            student_id: { type: 'string' },
            amount: { type: 'number' },
            item: { type: 'string' },
            method: { type: 'string' },
            due_date: { type: 'string' },
            status: { type: 'string' },
          },
        },
        Timetable: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            class_id: { type: 'string' },
            date: { type: 'string' },
            period: { type: 'string' },
            subject: { type: 'string' },
            teacher_id: { type: 'string' },
          },
        },
        Resource: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            url: { type: 'string' },
            uploaded_by: { type: 'string' },
            uploaded_at: { type: 'string' },
            downloads: { type: 'number' },
            material_type: { type: 'string' },
            filename: { type: 'string' },
          },
        },
        TeacherDashboardSummary: {
          type: 'object',
          properties: {
            total_students: { type: 'number' },
            assigned_classes: { type: 'number' },
            pending_assignments: { type: 'number' },
            attendance_rate: { type: 'number' },
            today_schedule: {
              type: 'array',
              items: { $ref: '#/components/schemas/Timetable' },
            },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            student_id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            size: { type: 'string' },
            url: { type: 'string' },
          },
        },
        CalendarEvent: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string' },
            time: { type: 'string' },
            class_id: { type: 'string' },
          },
        },
        Application: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            student_id: { type: 'string' },
            status: { type: 'string' },
            details: { type: 'string' },
          },
        },
        AttendanceSummary: {
          type: 'object',
          properties: {
            present: { type: 'number' },
            absent: { type: 'number' },
            late: { type: 'number' },
            rate: { type: 'number' },
          },
        },
        AdminDashboardStats: {
          type: 'object',
          properties: {
            totalStudents: { type: 'number' },
            studentChange: { type: 'number' },
            totalTeachers: { type: 'number' },
            teacherChange: { type: 'number' },
            totalClasses: { type: 'number' },
            classChange: { type: 'number' },
            totalRevenue: { type: 'number' },
            revenueChange: { type: 'number' },
          },
        },
        EnrollmentTrendItem: {
          type: 'object',
          properties: {
            month: { type: 'string' },
            count: { type: 'number' },
          },
        },
        FeeTrendItem: {
          type: 'object',
          properties: {
            month: { type: 'string' },
            amount: { type: 'number' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Authenticate a user',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthRequest' } },
            },
          },
          responses: {
            '200': {
              description: 'JWT issued successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
              },
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'name', 'role'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    name: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'teacher', 'student', 'parent'] },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User registered successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/User' } },
              },
            },
            '400': {
              description: 'Invalid input or user already exists',
            },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'Logout a user',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'User logged out successfully',
            },
          },
        },
      },
      '/api/auth/refresh-token': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh authentication token',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'New token issued successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
              },
            },
          },
        },
      },
      '/api/auth/change-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Change user password',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['oldPassword', 'newPassword'],
                  properties: {
                    oldPassword: { type: 'string' },
                    newPassword: { type: 'string', minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Password changed successfully',
            },
            '400': {
              description: 'Invalid old password',
            },
          },
        },
      },
      '/api/students': {
        get: {
          tags: ['Students'],
          summary: 'List all students',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'A list of students',
              content: {
                'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Student' } } },
              },
            },
          },
        },
        post: {
          tags: ['Students'],
          summary: 'Create a student',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' },
              },
            },
          },
          responses: { '201': { description: 'Student created' } },
        },
      },
      '/api/students/{id}': {
        get: {
          tags: ['Students'],
          summary: 'Fetch a student record',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'Student record returned',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Student' } },
              },
            },
          },
        },
        put: {
          tags: ['Students'],
          summary: 'Update a student',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Student' } },
            },
          },
          responses: { '200': { description: 'Student updated' } },
        },
        delete: {
          tags: ['Students'],
          summary: 'Delete a student',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '204': { description: 'Student deleted' } },
        },
      },
      '/api/students/{id}/results': {
        get: {
          tags: ['Grades & Results'],
          summary: 'Get student results',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Results returned' } },
        },
      },
      '/api/students/{id}/exams': {
        get: {
          tags: ['Exams'],
          summary: 'Get exams for a student',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Exams returned' } },
        },
      },
      '/api/students/{id}/subjects': {
        get: {
          tags: ['Students'],
          summary: 'Get a student subject list',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Student subjects returned' } },
        },
      },
      '/api/students/{id}/statistics': {
        get: {
          tags: ['Students'],
          summary: 'Get student statistics',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Student statistics returned' } },
        },
      },
      '/api/students/{id}/attendance': {
        get: {
          tags: ['Attendance'],
          summary: 'Get a student attendance record',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Attendance returned' } },
        },
      },
      '/api/students/{id}/attendance/summary': {
        get: {
          tags: ['Attendance'],
          summary: 'Get summary of a student attendance',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Attendance summary returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/AttendanceSummary' } } } } },
        },
      },
      '/api/students/{id}/grades/trend': {
        get: {
          tags: ['Grades & Results'],
          summary: 'Get student grade trend',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Grade trend returned' } },
        },
      },
      '/api/students/{id}/report': {
        get: {
          tags: ['Students'],
          summary: 'Get a student report',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Student report returned' } },
        },
      },
      '/api/parents/{id}/children': {
        get: {
          tags: ['Parents'],
          summary: 'Get parent children list',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Children returned' } },
        },
      },
      '/api/teachers': {
        get: {
          tags: ['Teachers'],
          summary: 'List teachers',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Teachers returned' } },
        },
        post: {
          tags: ['Teachers'],
          summary: 'Create a teacher',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/User' } },
            },
          },
          responses: { '201': { description: 'Teacher created' } },
        },
      },
      '/api/teachers/stats': {
        get: {
          tags: ['Teachers'],
          summary: 'Get teacher statistics',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Teacher statistics returned',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/TeacherStats' } },
              },
            },
          },
        },
      },
      '/api/teachers/{id}': {
        get: {
          tags: ['Teachers'],
          summary: 'Get a teacher profile',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'Teacher returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            '404': { description: 'Teacher not found' },
          },
        },
        put: {
          tags: ['Teachers'],
          summary: 'Update a teacher',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/User' } },
            },
          },
          responses: { '200': { description: 'Teacher updated' } },
        },
        delete: {
          tags: ['Teachers'],
          summary: 'Delete a teacher',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '204': { description: 'Teacher deleted' } },
        },
      },
      '/api/library': {
        get: {
          tags: ['Library'],
          summary: 'Search or list library items',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Library items returned' } },
        },
        post: {
          tags: ['Library'],
          summary: 'Create a library item',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { type: 'object' } },
            },
          },
          responses: { '201': { description: 'Library item created' } },
        },
      },
      '/api/library/{id}/bookmark': {
        post: {
          tags: ['Library'],
          summary: 'Bookmark a library item',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '201': { description: 'Bookmarked successfully' } },
        },
      },
      '/api/library/{id}/borrow': {
        post: {
          tags: ['Library'],
          summary: 'Borrow a library item',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { type: 'object', properties: { dueDate: { type: 'string' } } } },
            },
          },
          responses: { '201': { description: 'Borrowing created' } },
        },
      },
      '/api/library/{id}/bookmarks': {
        get: {
          tags: ['Library'],
          summary: 'Get bookmarks for a library item',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Bookmarks returned' } },
        },
      },
      '/api/borrowings/{studentId}': {
        get: {
          tags: ['Library'],
          summary: 'Get borrowings for a student',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Borrowings returned' } },
        },
      },
      '/api/classes': {
        get: {
          tags: ['Classes'],
          summary: 'List classes',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Classes returned', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Class' } } } } } },
        },
        post: {
          tags: ['Classes'],
          summary: 'Create a class',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Class' } },
            },
          },
          responses: { '201': { description: 'Class created' } },
        },
      },
      '/api/classes/{id}': {
        get: {
          tags: ['Classes'],
          summary: 'Get a class record',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Class returned' } },
        },
        delete: {
          tags: ['Classes'],
          summary: 'Delete a class',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '204': { description: 'Class deleted' } },
        },
      },
      '/api/classes/{id}/students': {
        get: {
          tags: ['Classes'],
          summary: 'Get students in a class',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Students returned' } },
        },
      },
      '/api/subjects': {
        get: {
          tags: ['Classes'],
          summary: 'List all subjects',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Subjects returned',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Subject' } },
                },
              },
            },
          },
        },
        post: {
          tags: ['Classes'],
          summary: 'Create a new subject',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Subject' } },
            },
          },
          responses: { '201': { description: 'Subject created' } },
        },
      },
      '/api/attendance/{classId}': {
        get: {
          tags: ['Attendance'],
          summary: 'Get class attendance records',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Attendance records returned' } },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current authenticated user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Current user returned',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
          },
        },
      },
      '/api/teachers/me': {
        get: {
          tags: ['Teachers'],
          summary: 'Get current teacher profile',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Teacher profile returned',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
          },
        },
      },
      '/api/teachers/dashboard': {
        get: {
          tags: ['Teachers'],
          summary: 'Get dashboard summary for current teacher',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Teacher dashboard summary returned',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/TeacherDashboardSummary' } } },
            },
          },
        },
      },

      '/api/attendance': {
        post: {
          tags: ['Attendance'],
          summary: 'Create attendance records',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { type: 'array', items: { type: 'object' } } },
            },
          },
          responses: { '201': { description: 'Attendance records created' } },
        },
      },
      '/api/assignments/{classId}': {
        get: {
          tags: ['Assignments'],
          summary: 'Get assignments for a class',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Assignments returned' } },
        },
      },
      '/api/assignments': {
        post: {
          tags: ['Assignments'],
          summary: 'Create an assignment',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Assignment' } },
            },
          },
          responses: { '201': { description: 'Assignment created' } },
        },
      },
      '/api/exams/{classId}': {
        get: {
          tags: ['Exams'],
          summary: 'Get exams for a class',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Exams returned' } },
        },
      },
      '/api/exams': {
        get: {
          tags: ['Exams'],
          summary: 'List all exams (admin view)',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'All exams returned',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Exam' } } } },
            },
          },
        },
        post: {
          tags: ['Exams'],
          summary: 'Create an exam',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Exam' } },
            },
          },
          responses: { '201': { description: 'Exam created' } },
        },
      },
      '/api/exams/{id}': {
        delete: {
          tags: ['Exams'],
          summary: 'Delete an exam',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '204': { description: 'Exam deleted' } },
        },
      },
      '/api/resources': {
        get: {
          tags: ['Resources'],
          summary: 'List resources',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Resources returned' } },
        },
        post: {
          tags: ['Resources'],
          summary: 'Create a resource entry',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Resource' } },
            },
          },
          responses: { '201': { description: 'Resource created' } },
        },
      },
      '/api/resources/upload': {
        post: {
          tags: ['Resources'],
          summary: 'Upload a resource file',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    material_type: { type: 'string' },
                    file: { type: 'string', format: 'binary' },
                  },
                  required: ['title', 'file'],
                },
              },
            },
          },
          responses: { '201': { description: 'Resource uploaded' } },
        },
      },
      '/api/resources/{id}': {
        delete: {
          tags: ['Resources'],
          summary: 'Delete a resource',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '204': { description: 'Resource deleted' } },
        },
      },
      '/api/inventory': {
        get: {
          tags: ['Inventory'],
          summary: 'List inventory items',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Inventory returned' } },
        },
        post: {
          tags: ['Inventory'],
          summary: 'Create an inventory item',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { type: 'object' } },
            },
          },
          responses: { '201': { description: 'Inventory item created' } },
        },
      },
      '/api/inventory/{id}': {
        delete: {
          tags: ['Inventory'],
          summary: 'Delete inventory item',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '204': { description: 'Inventory item deleted' } },
        },
      },
      '/api/applications': {
        get: {
          tags: ['Applications'],
          summary: 'List applications',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Applications returned' } },
        },
        post: {
          tags: ['Applications'],
          summary: 'Create an application',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Application' } },
            },
          },
          responses: { '201': { description: 'Application created' } },
        },
      },
      '/api/applications/{id}': {
        put: {
          tags: ['Applications'],
          summary: 'Update an application',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Application' } },
            },
          },
          responses: { '200': { description: 'Application updated' } },
        },
      },
      '/api/grades': {
        post: {
          tags: ['Grades & Results'],
          summary: 'Create a grade',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Grade' } },
            },
          },
          responses: { '201': { description: 'Grade created' } },
        },
      },
      '/api/grades/{studentId}': {
        get: {
          tags: ['Grades & Results'],
          summary: 'Get grades for a student',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Grades returned' } },
        },
      },
      '/api/announcements': {
        get: {
          tags: ['Announcements'],
          summary: 'List announcements',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Announcements returned' } },
        },
        post: {
          tags: ['Announcements'],
          summary: 'Create announcement',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Announcement' } },
            },
          },
          responses: { '201': { description: 'Announcement created' } },
        },
      },
      '/api/announcements/{id}': {
        delete: {
          tags: ['Announcements'],
          summary: 'Delete announcement',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '204': { description: 'Announcement deleted' } },
        },
      },
      '/api/calendar-events': {
        get: {
          tags: ['Calendar'],
          summary: 'List calendar events',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Events returned' } },
        },
        post: {
          tags: ['Calendar'],
          summary: 'Create calendar event',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CalendarEvent' } },
            },
          },
          responses: { '201': { description: 'Event created' } },
        },
      },
      '/api/documents': {
        get: {
          tags: ['Documents'],
          summary: 'List documents',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Documents returned' } },
        },
      },
      '/api/messages': {
        get: {
          tags: ['Messaging'],
          summary: 'List messages',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Messages returned' } },
        },
        post: {
          tags: ['Messaging'],
          summary: 'Send a message',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Message' } },
            },
          },
          responses: { '201': { description: 'Message sent' } },
        },
      },
      '/api/fees': {
        get: {
          tags: ['Fees & Payments'],
          summary: 'List fees',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Fees returned' } },
        },
        post: {
          tags: ['Fees & Payments'],
          summary: 'Create a fee record',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Fee' } },
            },
          },
          responses: { '201': { description: 'Fee created' } },
        },
      },
      '/api/fees/{studentId}': {
        get: {
          tags: ['Fees & Payments'],
          summary: 'Get fees for a student',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Fees returned' } },
        },
      },
      '/api/fees/{id}': {
        put: {
          tags: ['Fees & Payments'],
          summary: 'Update a fee record',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Fee' } },
            },
          },
          responses: { '200': { description: 'Fee updated' } },
        },
      },
      '/api/fees/{studentId}/payment': {
        post: {
          tags: ['Fees & Payments'],
          summary: 'Process payment for student fees',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    amount: { type: 'number', description: 'Payment amount' },
                    method: { type: 'string', description: 'Payment method (card, bank, cash)' },
                    reference: { type: 'string', description: 'Transaction reference' },
                  },
                  required: ['amount', 'method'],
                },
              },
            },
          },
          responses: { '201': { description: 'Payment processed successfully' } },
        },
      },
      '/api/fees/{studentId}/transactions': {
        get: {
          tags: ['Fees & Payments'],
          summary: 'Get payment history/transactions for student',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'Payment transactions returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        student_id: { type: 'string' },
                        amount: { type: 'number' },
                        method: { type: 'string' },
                        reference: { type: 'string' },
                        status: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/inventory/stats': {
        get: {
          tags: ['Inventory'],
          summary: 'Get inventory statistics',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Inventory stats returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      totalItems: { type: 'number' },
                      categories: { type: 'number' },
                      lowStock: { type: 'number' },
                      available: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/fees/stats': {
        get: {
          tags: ['Fees & Payments'],
          summary: 'Get fees and billing statistics',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Fees stats returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      collected: { type: 'number' },
                      outstanding: { type: 'number' },
                      paidInFull: { type: 'number' },
                      'growth%': { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/fees/recent': {
        get: {
          tags: ['Fees & Payments'],
          summary: 'Get recent payment transactions',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Recent fees returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Fee' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/attendance/stats': {
        get: {
          tags: ['Attendance'],
          summary: 'Get attendance statistics',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Attendance stats returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      present: { type: 'number' },
                      absent: { type: 'number' },
                      late: { type: 'number' },
                      'classAvg%': { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/attendance/weekly-trend': {
        get: {
          tags: ['Attendance'],
          summary: 'Get weekly attendance trend (Mon-Fri)',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Weekly attendance trend returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        day: { type: 'string' },
                        present: { type: 'number' },
                        total: { type: 'number' },
                        percentage: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      '/api/exam-marks/{examId}': {
        get: {
          tags: ['Exams'],
          summary: 'Get marks for a specific exam',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'Exam marks returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        exam_id: { type: 'string' },
                        student_id: { type: 'string' },
                        student_name: { type: 'string' },
                        marks_obtained: { type: 'number' },
                        grade: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/report-cards': {
        get: {
          tags: ['Grades & Results'],
          summary: 'List all report cards',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'studentId',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Filter report cards by student ID',
            },
          ],
          responses: {
            '200': {
              description: 'Report cards returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Grade' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/users': {
        get: {
          tags: ['Administration'],
          summary: 'List all users (admin only)',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Users list returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                        status: { type: 'string' },
                        created_at: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/school-profile': {
        get: {
          tags: ['Administration'],
          summary: 'Get school profile settings',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'School profile returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      school_name: { type: 'string' },
                      address: { type: 'string' },
                      contact_phone: { type: 'string' },
                      public_email: { type: 'string' },
                      motto_slogan: { type: 'string' },
                      system_currency: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ['Administration'],
          summary: 'Update school profile settings',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    schoolName: { type: 'string' },
                    address: { type: 'string' },
                    contactPhone: { type: 'string' },
                    publicEmail: { type: 'string' },
                    mottoSlogan: { type: 'string' },
                    systemCurrency: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'School profile updated' } },
        },
      },
      '/api/admin/settings': {
        get: {
          tags: ['Administration'],
          summary: 'Get system settings',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'System settings returned',
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Administration'],
          summary: 'Create or update a system setting',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    settingKey: { type: 'string' },
                    settingValue: { type: 'string' },
                    settingType: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Setting saved' } },
        },
      },
      '/api/admin/generate-document': {
        post: {
          tags: ['Administration'],
          summary: 'Generate a document (certificate, report card, etc)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    studentId: { type: 'string' },
                    documentType: { type: 'string', enum: ['Report Card', 'Clearance Letter', 'Transfer Letter', 'Admission Letter', 'Award Certificate'] },
                    fileName: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Document generated' } },
        },
      },
      '/api/admin/documents/recent': {
        get: {
          tags: ['Administration'],
          summary: 'Get recently generated documents',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Recent documents returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        student_id: { type: 'string' },
                        student_name: { type: 'string' },
                        document_type: { type: 'string' },
                        file_name: { type: 'string' },
                        status: { type: 'string' },
                        created_at: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/audit-logs': {
        get: {
          tags: ['Administration'],
          summary: 'Get audit logs',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'number', default: 50 },
              description: 'Number of logs to retrieve',
            },
          ],
          responses: {
            '200': {
              description: 'Audit logs returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        admin_id: { type: 'string' },
                        admin_name: { type: 'string' },
                        action: { type: 'string' },
                        entity_type: { type: 'string' },
                        entity_id: { type: 'string' },
                        description: { type: 'string' },
                        created_at: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/dashboard/stats': {
        get: {
          tags: ['Administration'],
          summary: 'Get admin dashboard summary statistics',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Dashboard summary statistics returned',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AdminDashboardStats' },
                },
              },
            },
          },
        },
      },
      '/api/admin/dashboard/enrollment': {
        get: {
          tags: ['Administration'],
          summary: 'Get enrollment trend data for admin dashboard',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Enrollment trend data returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/EnrollmentTrendItem' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/dashboard/fees': {
        get: {
          tags: ['Administration'],
          summary: 'Get fee collection trend data for admin dashboard',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Fee collection trend data returned',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/FeeTrendItem' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/timetable/{classId}': {
        get: {
          tags: ['Timetable'],
          summary: 'Get timetable for a class',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Timetable returned' } },
        },
      },
      '/api/timetable': {
        post: {
          tags: ['Timetable'],
          summary: 'Create a timetable entry',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Timetable' } },
            },
          },
          responses: { '201': { description: 'Timetable entry created' } },
        },
      },
    },
  };

  // Load custom CSS to simplify the responses panel (hide media type selector,
  // "Example Value" and "Schema" panels) so docs show only status codes
  // and descriptions.
  const swaggerUiOptions = {
    customCss: fs.existsSync(path.join(__dirname, 'swagger-custom.css'))
      ? fs.readFileSync(path.join(__dirname, 'swagger-custom.css'), 'utf8')
      : '',
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: -1,
    },
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

  const mapUserRow = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    subject: user.subject,
    grade: user.grade,
    classes: user.classes || null,
    status: user.status || null,
    qualification: user.qualification || null,
  });

  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user;
      next();
    });
  };

  // seed helper
  const seedInitialData = async () => {
    const teacherUser = await db('users').where({ email: 'teacher@example.com' }).first();
    if (!teacherUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db('users').insert({ id: uuidv4(), email: 'teacher@example.com', password: hashedPassword, name: 'John Doe', role: 'teacher', subject: 'Mathematics' });
    }

    const studentUser = await db('users').where({ email: 'student@example.com' }).first();
    if (!studentUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db('users').insert({ id: uuidv4(), email: 'student@example.com', password: hashedPassword, name: 'Jane Smith', role: 'student', grade: '10th Grade' });
    }

    const adminUser = await db('users').where({ email: 'admin@example.com' }).first();
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db('users').insert({ id: uuidv4(), email: 'admin@example.com', password: hashedPassword, name: 'Admin User', role: 'admin' });
    }

    const parentUser = await db('users').where({ email: 'parent@example.com' }).first();
    let parentUserId;
    if (!parentUser) {
      parentUserId = uuidv4();
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db('users').insert({ id: parentUserId, email: 'parent@example.com', password: hashedPassword, name: 'Mrs. Ndlovu', role: 'parent' });
    } else {
      parentUserId = parentUser.id;
    }

    const studentRow = await db('students').where({ id: 'BPS-2451' }).first();
    if (!studentRow) {
      await db('students').insert({
        id: 'BPS-2451',
        name: 'Tawanda Ndlovu',
        class: 'Form 4A',
        stream: 'Sciences',
        gender: 'M',
        date_of_birth: '2009-03-12',
        blood_group: 'O+',
        address: '45 Borrowdale Rd, Harare',
        status: 'Active',
        email: 'tawanda.ndlovu@schoolmanagement.edu',
        phone: '+263 77 333 4455',
        guardian_name: 'Mrs. Ndlovu',
        guardian_email: 'parent@example.com',
        guardian_phone: '+263 77 555 8888',
        guardian_user_id: parentUserId,
        current_gpa: 3.4,
      });
    }

    const classRow = await db('classes').where({ name: 'Form 4A Sciences' }).first();
    let classId;
    if (!classRow) {
      const [createdClass] = await db('classes').insert({
        teacher_id: teacherUser.id,
        name: 'Form 4A Sciences',
        subject: 'Science',
        subject_code: 'SCI401',
        grade: 'Form 4A',
      }).returning('*');
      classId = createdClass.id;
    } else {
      classId = classRow.id;
    }

    const studentClass = await db('student_classes').where({ student_id: 'BPS-2451', class_id: classId }).first();
    if (!studentClass) {
      await db('student_classes').insert({ student_id: 'BPS-2451', class_id: classId });
    }

    const existingExam = await db('exams').where({ class_id: classId, name: 'Math Midterm' }).first();
    if (!existingExam) {
      await db('exams').insert({ class_id: classId, teacher_id: teacherUser.id, name: 'Math Midterm', date: '2025-05-15' });
    }

    const existingGrade = await db('grades').where({ student_id: 'BPS-2451', subject: 'Mathematics', exam_name: 'Term 1' }).first();
    if (!existingGrade) {
      await db('grades').insert({ student_id: 'BPS-2451', subject: 'Mathematics', exam_name: 'Term 1', score: 78, grade: 'B+' });
    }

    const attendanceExists = await db('attendance').where({ student_id: 'BPS-2451' }).first();
    if (!attendanceExists) {
      await db('attendance').insert([
        { class_id: classId, student_id: 'BPS-2451', teacher_id: teacherUser.id, date: '2025-04-20', status: 'present' },
        { class_id: classId, student_id: 'BPS-2451', teacher_id: teacherUser.id, date: '2025-04-19', status: 'absent' },
        { class_id: classId, student_id: 'BPS-2451', teacher_id: teacherUser.id, date: '2025-04-18', status: 'late' },
      ]);
    }

    const feeExists = await db('fees').where({ student_id: 'BPS-2451' }).first();
    if (!feeExists) {
      await db('fees').insert({ student_id: 'BPS-2451', amount: 760.0, item: 'Term 1 — Full', method: 'Bank Transfer', due_date: '2025-04-30', status: 'Pending' });
    }

    const announcementCount = await db('announcements').count('* as cnt').first();
    if (!announcementCount || Number(announcementCount.cnt || announcementCount.count || 0) === 0) {
      await db('announcements').insert({ title: 'Term 2 fees due by 30 April', message: 'Please clear all outstanding balances before the deadline.', created_by: adminUser.id });
    }

    const documentsCount = await db('documents').count('* as cnt').first();
    if (!documentsCount || Number(documentsCount.cnt || documentsCount.count || 0) === 0) {
      await db('documents').insert([
        { student_id: 'BPS-2451', name: 'Term 1 2025 Report Card', type: 'Report Card', size: '320 KB', url: '/docs/term1-2025-report-card.pdf' },
        { student_id: 'BPS-2451', name: 'Term 1 2025 Fee Receipt', type: 'Receipt', size: '120 KB', url: '/docs/term1-2025-fee-receipt.pdf' },
      ]);
    }

    const messageCount = await db('messages').count('* as cnt').first();
    if (!messageCount || Number(messageCount.cnt || messageCount.count || 0) === 0) {
      await db('messages').insert([
        { sender_id: 'teacher-1', sender_name: 'Mr. Mhlanga', receiver_id: 'p1', receiver_name: 'Mrs. Ndlovu', subject: 'Attendance follow-up', text: 'Please remember to sign the field trip form.', is_new: true },
        { sender_id: 'p1', sender_name: 'Mrs. Ndlovu', receiver_id: 'teacher-1', receiver_name: 'Mr. Mhlanga', subject: 'Re: Attendance follow-up', text: 'Thanks, I will sign it today.', is_new: false },
      ]);
    }

    const schoolProfileCount = await db('school_profile').count('* as cnt').first();
    if (!schoolProfileCount || Number(schoolProfileCount.cnt || schoolProfileCount.count || 0) === 0) {
      await db('school_profile').insert({
        school_name: 'School Management',
        address: '123 Borrowdale Rd, Harare, Zimbabwe',
        contact_phone: '+263 242 333 100',
        public_email: 'info@schoolmanagement.edu',
        motto_slogan: 'Knowledge Discipline Excellence',
        system_currency: 'USD',
      });
    }

    const settingsCount = await db('system_settings').count('* as cnt').first();
    if (!settingsCount || Number(settingsCount.cnt || settingsCount.count || 0) === 0) {
      await db('system_settings').insert([
        { setting_key: 'require_mfa', setting_value: 'true', setting_type: 'boolean', description: 'Require Multi-Factor Authentication' },
        { setting_key: 'auto_backup', setting_value: 'true', setting_type: 'boolean', description: 'Automatic daily backup' },
        { setting_key: 'backup_time', setting_value: '00:00', setting_type: 'string', description: 'Time for automatic backup (UTC)' },
        { setting_key: 'admin_alert_email', setting_value: 'true', setting_type: 'boolean', description: 'Administrative email alerts' },
        { setting_key: 'sms_notifications', setting_value: 'false', setting_type: 'boolean', description: 'Emergency SMS notifications' },
      ]);
    }

    const generatedDocsCount = await db('generated_documents').count('* as cnt').first();
    if (!generatedDocsCount || Number(generatedDocsCount.cnt || generatedDocsCount.count || 0) === 0) {
      await db('generated_documents').insert([
        { student_id: 'BPS-2451', document_type: 'Report Card', file_name: 'report_card_BPS-2451_20250416.pdf', url: '/documents/BPS-2451/report_card_20250416.pdf', status: 'generated', generated_by: adminUser.id },
        { student_id: 'BPS-2451', document_type: 'Clearance Letter', file_name: 'clearance_BPS-2451_20250414.pdf', url: '/documents/BPS-2451/clearance_20250414.pdf', status: 'generated', generated_by: adminUser.id },
      ]);
    }
  };

  // minimal auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password || !role) return res.status(400).json({ message: 'Email, password and role are required' });

      const user = await db('users').where({ email, role }).first();
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: mapUserRow(user) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password || !name || !role) {
        return res.status(400).json({ message: 'Email, password, name, and role are required' });
      }

      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await db('users').insert({
        email,
        password: hashedPassword,
        name,
        role,
        created_at: new Date(),
      });

      const newUser = await db('users').where({ id: userId[0] }).first();
      res.status(201).json(mapUserRow(newUser));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/refresh-token', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await db('users').where({ id: userId }).first();
      if (!user) return res.status(404).json({ message: 'User not found' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: mapUserRow(user) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required' });
      }

      const userId = req.user.id;
      const user = await db('users').where({ id: userId }).first();
      if (!user) return res.status(404).json({ message: 'User not found' });

      const validPassword = await bcrypt.compare(oldPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid old password' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await db('users').where({ id: userId }).update({ password: hashedNewPassword });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      const user = await db('users').where({ id: req.user.id }).first();
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(mapUserRow(user));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/teachers/me', authenticateToken, async (req, res) => {
    try {
      const user = await db('users').where({ id: req.user.id, role: 'teacher' }).first();
      if (!user) return res.status(404).json({ message: 'Teacher not found' });
      res.json(mapUserRow(user));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/teachers/dashboard', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Permission denied' });
      const teacherId = req.user.id;

      const classes = await db('classes').where({ teacher_id: teacherId }).select('*');
      const classIds = classes.map((c) => c.id);

      const totalStudents = classIds.length
        ? await db('student_classes').whereIn('class_id', classIds).countDistinct('student_id as count').first()
        : { count: 0 };

      const pendingAssignments = await db('assignments')
        .where({ teacher_id: teacherId })
        .count('* as count')
        .first();

      const today = new Date().toISOString().split('T')[0];
      const attendanceRecords = classIds.length
        ? await db('attendance').whereIn('class_id', classIds).andWhere('date', today).select('*')
        : [];

      const attendanceRate = attendanceRecords.length
        ? Math.round((attendanceRecords.filter((row) => row.status === 'present').length / attendanceRecords.length) * 100)
        : 0;

      const todaySchedule = await db('timetable')
        .whereIn('class_id', classIds)
        .andWhere('date', today)
        .select('*');

      res.json({
        total_students: Number(totalStudents.count || 0),
        assigned_classes: classes.length,
        pending_assignments: Number(pendingAssignments.count || 0),
        attendance_rate: attendanceRate,
        today_schedule: todaySchedule,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/teachers/:id', authenticateToken, async (req, res) => {
    try {
      const teacher = await db('users').where({ id: req.params.id, role: 'teacher' }).first();
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
      res.json(mapUserRow(teacher));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/teachers/:id', authenticateToken, async (req, res) => {
    try {
      if (req.user.id !== req.params.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });
      const updates = {
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        classes: req.body.classes,
        status: req.body.status,
        qualification: req.body.qualification,
        grade: req.body.grade,
      };
      const updated = await db('users')
        .where({ id: req.params.id, role: 'teacher' })
        .update(updates)
        .returning('*');
      if (!updated[0]) return res.status(404).json({ message: 'Teacher not found' });
      res.json(mapUserRow(updated[0]));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // simple students endpoints used by UI/tests
  app.get('/api/students/:id', authenticateToken, async (req, res) => {
    try {
      const student = await db('students').where({ id: req.params.id }).first();
      if (!student) return res.status(404).json({ message: 'Student not found' });
      res.json(student);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/students/:id/results', authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
      const grades = await db('grades').where({ student_id: studentId }).orderBy('created_at', 'desc').select('*');
      res.json(grades);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/students/:id/exams', authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
      const sc = await db('student_classes').where({ student_id: studentId }).first();
      const classId = sc?.class_id;
      const exams = classId ? await db('exams').where({ class_id: classId }).orderBy('date', 'asc') : [];
      const upcoming = exams.filter(e => new Date(e.date) >= new Date());
      res.json({ exams, upcoming });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- Library endpoints ---
  app.get('/api/library', authenticateToken, async (req, res) => {
    try {
      const q = req.query.q || null;
      let query = db('library_items');
      if (q) {
        // simple search
        const rows = await query.select('*');
        const filtered = rows.filter(r => (r.title || '').toLowerCase().includes(q.toLowerCase()) || (r.author || '').toLowerCase().includes(q.toLowerCase()));
        return res.json(filtered);
      }
      const rows = await query.select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/library', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'teacher' && req.user.role !== 'admin') return res.status(403).json({ message: 'Only staff can add library items' });
      const payload = {
        title: req.body.title,
        author: req.body.author,
        subject: req.body.subject,
        isbn: req.body.isbn || null,
        description: req.body.description || null,
        digital_url: req.body.digitalUrl || null,
        is_physical: req.body.isPhysical !== false,
        copies: req.body.copies || 1,
      };
      const [created] = await db('library_items').insert(payload).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/library/:id/bookmark', authenticateToken, async (req, res) => {
    try {
      const itemId = req.params.id;
      const userId = req.user.id;
      const [created] = await db('bookmarks').insert({ user_id: userId, item_id: itemId }).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/library/:id/bookmarks', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const rows = await db('bookmarks').where({ user_id: userId }).select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/library/:id/borrow', authenticateToken, async (req, res) => {
    try {
      const studentId = req.user.role === 'student' ? req.user.id : req.body.studentId;
      const itemId = req.params.id;
      const due = req.body.dueDate || null;
      const [created] = await db('borrowings').insert({ student_id: studentId, item_id: itemId, due_date: due }).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/borrowings/:studentId', authenticateToken, async (req, res) => {
    try {
      const sid = req.params.studentId;
      const rows = await db('borrowings').where({ student_id: sid }).select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/classes', authenticateToken, async (req, res) => {
    try {
      const classes = await db('classes').select('*');
      res.json(classes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/classes/:id', authenticateToken, async (req, res) => {
    try {
      const cls = await db('classes').where({ id: req.params.id }).first();
      if (!cls) return res.status(404).json({ message: 'Class not found' });
      res.json(cls);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get students in a specific class
  app.get('/api/classes/:id/students', authenticateToken, async (req, res) => {
    try {
      const classId = req.params.id;
      const studentIds = await db('student_classes').where({ class_id: classId }).select('student_id');
      const students = await db('students').whereIn('id', studentIds.map(s => s.student_id)).select('*');
      res.json(students);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/classes', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      const { name, teacher_id, subject, subject_code, grade, room, max_students } = req.body;
      const [created] = await db('classes').insert({
        teacher_id: teacher_id || req.user.id,
        name,
        subject,
        subject_code,
        grade,
        room: room || null,
        max_students: max_students || 30,
      }).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/classes/:id', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });
      const deleted = await db('classes').where({ id: req.params.id }).del();
      if (!deleted) return res.status(404).json({ message: 'Class not found' });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/attendance/:classId', authenticateToken, async (req, res) => {
    try {
      const rows = await db('attendance').where({ class_id: req.params.classId }).select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/attendance', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      const payloads = Array.isArray(req.body) ? req.body : [req.body];
      const normalized = payloads.map((item) => ({
        class_id: item.class_id,
        student_id: item.student_id,
        teacher_id: req.user.id,
        date: item.date,
        status: item.status,
        created_at: item.created_at || new Date(),
      }));
      const insertQuery = db('attendance').insert(normalized);
      let createdResult;
      if (typeof insertQuery.returning === 'function') {
        createdResult = await insertQuery.returning('*');
      } else {
        createdResult = await insertQuery;
      }
      res.status(201).json(Array.isArray(createdResult) ? createdResult : [createdResult]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/assignments/:classId', authenticateToken, async (req, res) => {
    try {
      const rows = await db('assignments').where({ class_id: req.params.classId }).select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/assignments', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      
      const { class_id, title, subject, description, due_date } = req.body;
      if (!class_id || !title) {
        return res.status(400).json({ message: 'class_id and title are required' });
      }

      const [created] = await db('assignments').insert({
        class_id,
        teacher_id: req.user.id,
        title,
        subject: subject || null,
        description: description || null,
        due_date: due_date || null,
      }).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/exams/:classId', authenticateToken, async (req, res) => {
    try {
      const rows = await db('exams').where({ class_id: req.params.classId }).select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/exams', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      
      const { class_id, name, subject, date, total_marks } = req.body;
      if (!class_id || !name || !date) {
        return res.status(400).json({ message: 'class_id, name, and date are required' });
      }

      const [created] = await db('exams').insert({
        class_id,
        teacher_id: req.user.id,
        name,
        subject: subject || null,
        date,
        total_marks: total_marks || null,
      }).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/exams/:id', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });
      const deleted = await db('exams').where({ id: req.params.id }).del();
      if (!deleted) return res.status(404).json({ message: 'Exam not found' });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/teachers', authenticateToken, async (req, res) => {
    try {
      const rows = await db('users').where({ role: 'teacher' }).select('*');
      res.json(rows.map(mapUserRow));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/teachers', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });
      const { name, email, subject, classes, status, qualification } = req.body;
      if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
      const hashedPassword = await bcrypt.hash('password123', 10);
      const [created] = await db('users').insert({
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        role: 'teacher',
        subject: subject || null,
        grade: null,
        classes: classes || null,
        status: status || 'Active',
        qualification: qualification || null,
      }).returning('*');
      res.status(201).json(mapUserRow(created));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/teachers/:id', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });
      const updates = {
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        classes: req.body.classes,
        status: req.body.status,
        qualification: req.body.qualification,
      };
      const updated = await db('users').where({ id: req.params.id, role: 'teacher' }).update(updates).returning('*');
      res.json(updated[0] ? mapUserRow(updated[0]) : null);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/teachers/:id', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });
      await db('users').where({ id: req.params.id, role: 'teacher' }).del();
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get all subjects
  app.get('/api/subjects', authenticateToken, async (req, res) => {
    try {
      const subjects = await db('subjects').select('*');
      
      // Enrich with teacher and class counts
      const enriched = await Promise.all(subjects.map(async (subject) => {
        const teacherCount = await db('users')
          .where({ role: 'teacher' })
          .where(db.raw("classes ILIKE ?", [`%${subject.name}%`]))
          .count('* as count')
          .first();
        
        const classCount = await db('classes')
          .where({ subject: subject.name })
          .count('* as count')
          .first();
        
        return {
          ...subject,
          teachersCount: teacherCount?.count || 0,
          classesCount: classCount?.count || 0,
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Create new subject
  app.post('/api/subjects', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ message: 'Subject name is required' });
      
      const [created] = await db('subjects').insert({
        name,
        description: description || null,
      }).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get teacher statistics
  app.get('/api/teachers/stats', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });
      
      const totalTeachers = await db('users').where({ role: 'teacher' }).count('* as count').first();
      
      // Active today (teachers with attendance records today)
      const today = new Date().toISOString().split('T')[0];
      const activeToday = await db('attendance')
        .where(db.raw("DATE(date) = ?", [today]))
        .distinct('teacher_id')
        .count('* as count')
        .first();
      
      // Count distinct subjects
      const subjects = await db('users')
        .where({ role: 'teacher' })
        .where(db.raw("subject IS NOT NULL"))
        .distinct('subject')
        .count('* as count')
        .first();
      
      // Sick leaves (teachers with 'On Leave' status)
      const sickLeaves = await db('users')
        .where({ role: 'teacher', status: 'On Leave' })
        .count('* as count')
        .first();
      
      res.json({
        totalTeachers: totalTeachers?.count || 0,
        activeToday: activeToday?.count || 0,
        totalSubjects: subjects?.count || 0,
        sickLeaves: sickLeaves?.count || 0,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Admin Dashboard Stats
  app.get('/api/admin/dashboard/stats', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });

      // Get total counts
      const totalStudents = await db('students').count('* as count').first();
      const totalTeachers = await db('users').where({ role: 'teacher' }).count('* as count').first();
      const totalClasses = await db('classes').count('* as count').first();
      const totalRevenue = await db('fees').where({ status: 'paid' }).sum('amount as total').first();

      // Get last month's data for comparison
      const lastMonthStart = new Date();
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      lastMonthStart.setDate(1);
      const lastMonthEnd = new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth() + 1, 0);

      const studentsLastMonth = await db('students')
        .where(db.raw("DATE(created_at) BETWEEN ? AND ?", [lastMonthStart, lastMonthEnd]))
        .count('* as count')
        .first();

      const teachersLastMonth = await db('users')
        .where({ role: 'teacher' })
        .where(db.raw("DATE(created_at) BETWEEN ? AND ?", [lastMonthStart, lastMonthEnd]))
        .count('* as count')
        .first();

      const classesLastMonth = await db('classes')
        .where(db.raw("DATE(created_at) BETWEEN ? AND ?", [lastMonthStart, lastMonthEnd]))
        .count('* as count')
        .first();

      const revenueLastMonth = await db('fees')
        .where({ status: 'paid' })
        .where(db.raw("DATE(paid_date) BETWEEN ? AND ?", [lastMonthStart, lastMonthEnd]))
        .sum('amount as total')
        .first();

      // Calculate percentages
      const studentsCount = totalStudents?.count || 0;
      const studentsLastMonthCount = studentsLastMonth?.count || 0;
      const studentChange = studentsLastMonthCount > 0 ? Math.round(((studentsCount - studentsLastMonthCount) / studentsLastMonthCount) * 100) : 0;

      const teachersCount = totalTeachers?.count || 0;
      const teachersLastMonthCount = teachersLastMonth?.count || 0;
      const teacherChange = teachersLastMonthCount > 0 ? Math.round(((teachersCount - teachersLastMonthCount) / teachersLastMonthCount) * 100) : 0;

      const classesCount = totalClasses?.count || 0;
      const classesLastMonthCount = classesLastMonth?.count || 0;
      const classChange = classesLastMonthCount > 0 ? Math.round(((classesCount - classesLastMonthCount) / classesLastMonthCount) * 100) : 0;

      const revenueAmount = totalRevenue?.total || 0;
      const revenueLastMonthAmount = revenueLastMonth?.total || 0;
      const revenueChange = revenueLastMonthAmount > 0 ? Math.round(((revenueAmount - revenueLastMonthAmount) / revenueLastMonthAmount) * 100) : 0;

      res.json({
        totalStudents: studentsCount,
        studentChange,
        totalTeachers: teachersCount,
        teacherChange,
        totalClasses: classesCount,
        classChange,
        totalRevenue: revenueAmount,
        revenueChange,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Admin Dashboard Enrollment Chart (last 7 months)
  app.get('/api/admin/dashboard/enrollment', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });

      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const monthStart = new Date(year, date.getMonth(), 1);
        const monthEnd = new Date(year, date.getMonth() + 1, 0);

        const count = await db('students')
          .where(db.raw("DATE(created_at) <= ?", [monthEnd]))
          .count('* as count')
          .first();

        data.push({ month, count: count?.count || 0 });
      }
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Admin Dashboard Fee Collection Chart (last 7 months)
  app.get('/api/admin/dashboard/fees', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });

      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const monthStart = new Date(year, date.getMonth(), 1);
        const monthEnd = new Date(year, date.getMonth() + 1, 0);

        const revenue = await db('fees')
          .where({ status: 'paid' })
          .where(db.raw("DATE(paid_date) BETWEEN ? AND ?", [monthStart, monthEnd]))
          .sum('amount as total')
          .first();

        data.push({ month, amount: revenue?.total || 0 });
      }
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/resources', authenticateToken, async (req, res) => {
    try {
      const rows = await db('resources').select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/resources', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      const [created] = await db('resources').insert(req.body).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/resources/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      if (!req.file) return res.status(400).json({ message: 'File upload is required' });

      const title = req.body.title || req.file.originalname;
      const materialType = req.body.material_type || req.body.type || 'document';
      const url = `/uploads/${req.file.filename}`;

      const [created] = await db('resources').insert({
        uploaded_by: req.user.id,
        title,
        url,
        uploaded_at: new Date(),
        downloads: 0,
        material_type: materialType,
        filename: req.file.originalname,
      }).returning('*');

      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/resources/:id', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      await db('resources').where({ id: req.params.id }).del();
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/inventory', authenticateToken, async (req, res) => {
    try {
      const rows = await db('inventory_items').select('*').orderBy('name', 'asc');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/inventory', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      const { name, category, qty, assigned, status } = req.body;
      if (!name || typeof qty !== 'number') {
        return res.status(400).json({ message: 'Name and qty are required' });
      }
      const available = qty - (assigned || 0);
      const normalizedStatus = status || (available <= 0 ? 'Out of Stock' : available <= 10 ? 'Low Stock' : 'In Stock');
      const [created] = await db('inventory_items').insert({
        name,
        category: category || null,
        qty,
        assigned: assigned || 0,
        status: normalizedStatus,
      }).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/inventory/:id', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      await db('inventory_items').where({ id: req.params.id }).del();
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/students', authenticateToken, async (req, res) => {
    try {
      const rows = await db('students').select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/students', authenticateToken, async (req, res) => {
    try {
      const [created] = await db('students').insert(req.body).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/students/:id', authenticateToken, async (req, res) => {
    try {
      const updated = await db('students').where({ id: req.params.id }).update(req.body).returning('*');
      res.json(updated[0] || null);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/students/:id', authenticateToken, async (req, res) => {
    try {
      await db('students').where({ id: req.params.id }).del();
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/students/:id/subjects', authenticateToken, async (req, res) => {
    try {
      const rows = await db('grades').where({ student_id: req.params.id }).distinct('subject');
      res.json(rows.map(r => r.subject));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/students/:id/statistics', authenticateToken, async (req, res) => {
    try {
      const totalGrades = await db('grades').where({ student_id: req.params.id }).count('* as count').first();
      const average = await db('grades').where({ student_id: req.params.id }).avg('score as avg').first();
      res.json({ totalGrades: totalGrades?.count || 0, average: Math.round(parseFloat(average?.avg || 0) * 100) / 100 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/parents/:id/children', authenticateToken, async (req, res) => {
    try {
      const parentId = req.params.id;
      if (req.user.role !== 'parent' && req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });

      let rows = await db('students').where({ guardian_user_id: parentId }).select('*');
      if (rows.length === 0 && req.user.email) {
        rows = await db('students').where({ guardian_email: req.user.email }).select('*');
      }

      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/applications', authenticateToken, async (req, res) => {
    try {
      const rows = await db('applications').select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/applications', authenticateToken, async (req, res) => {
    try {
      const [created] = await db('applications').insert(req.body).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/applications/:id', authenticateToken, async (req, res) => {
    try {
      const updated = await db('applications').where({ id: req.params.id }).update(req.body).returning('*');
      res.json(updated[0] || null);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/grades/:studentId', authenticateToken, async (req, res) => {
    try {
      const rows = await db('grades').where({ student_id: req.params.studentId }).select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/grades', authenticateToken, async (req, res) => {
    try {
      const [created] = await db('grades').insert(req.body).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/announcements', authenticateToken, async (req, res) => {
    try {
      const rows = await db('announcements').select('*').orderBy('created_at', 'desc');
      res.json(rows.map((row) => ({ ...row, body: row.message })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/announcements', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      const audience = req.body.audience || req.body.type || 'general';
      const typeMap = {
        All: 'general',
        Parents: 'parents',
        Students: 'students',
        Teachers: 'teachers',
      };
      const payload = {
        title: req.body.title,
        message: req.body.body || req.body.content || req.body.message || '',
        type: typeMap[audience] || audience,
        created_by: req.user.id,
      };
      const [created] = await db('announcements').insert(payload).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/announcements/:id', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      await db('announcements').where({ id: req.params.id }).del();
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Calendar Events endpoints
  app.get('/api/calendar-events', authenticateToken, async (req, res) => {
    try {
      const rows = await db('calendar_events').select('*').orderBy('event_date', 'asc');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/calendar-events', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      
      const { title, description, event_date, event_time, event_type, class: className, location } = req.body;
      if (!title || !event_date) {
        return res.status(400).json({ message: 'title and event_date are required' });
      }

      const [created] = await db('calendar_events').insert({
        teacher_id: req.user.id,
        title,
        description: description || null,
        event_date,
        event_time: event_time || null,
        event_type: event_type || 'event',
        class: className || null,
        location: location || null,
      }).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/documents', authenticateToken, async (req, res) => {
    try {
      const studentId = req.query.studentId;
      if (!studentId) return res.status(400).json({ message: 'studentId query is required' });
      const student = await db('students').where({ id: studentId }).first();
      if (!student) return res.status(404).json({ message: 'Student not found' });
      if (req.user.role === 'parent' && student.guardian_user_id !== req.user.id && student.guardian_email !== req.user.email) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      const rows = await db('documents').where({ student_id: studentId }).orderBy('created_at', 'desc');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
      const userId = req.query.userId || req.user.id;
      const rows = await db('messages')
        .where({ sender_id: userId })
        .orWhere({ receiver_id: userId })
        .orderBy('created_at', 'asc');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/messages', authenticateToken, async (req, res) => {
    try {
      const payload = {
        sender_id: req.user.id,
        sender_name: req.user.name || '',
        receiver_id: req.body.receiverId,
        receiver_name: req.body.receiverName,
        subject: req.body.subject || '',
        text: req.body.text || '',
        is_new: true,
      };
      const insertQuery = db('messages').insert(payload);
      let created;
      if (insertQuery && typeof insertQuery.returning === 'function') {
        const result = await insertQuery.returning('*');
        created = Array.isArray(result) ? result[0] : result;
      } else {
        created = await insertQuery;
      }
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/fees', authenticateToken, async (req, res) => {
    try {
      const studentId = req.query.studentId;
      const query = db('fees').select('*').orderBy('created_at', 'desc');
      if (studentId) query.where({ student_id: studentId });
      const rows = await query;
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/fees/:studentId', authenticateToken, async (req, res) => {
    try {
      const rows = await db('fees').where({ student_id: req.params.studentId }).select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/fees', authenticateToken, async (req, res) => {
    try {
      const insertQuery = db('fees').insert(req.body);
      let createdResult;
      if (typeof insertQuery.returning === 'function') {
        createdResult = await insertQuery.returning('*');
      } else {
        createdResult = await insertQuery;
      }
      const created = Array.isArray(createdResult) ? createdResult[0] : createdResult;
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/fees/:id', authenticateToken, async (req, res) => {
    try {
      const updated = await db('fees').where({ id: req.params.id }).update(req.body).returning('*');
      res.json(updated[0] || null);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Payment Processing - Process payment for student fees
  app.post('/api/fees/:studentId/payment', authenticateToken, async (req, res) => {
    try {
      const { studentId } = req.params;
      const { amount, method, reference } = req.body;

      if (!amount || !method) {
        return res.status(400).json({ message: 'Amount and method are required' });
      }

      // Create payment transaction record
      const payload = {
        student_id: studentId,
        amount,
        method,
        reference: reference || `TXN-${Date.now()}`,
        status: 'completed',
        created_at: new Date(),
      };

      const insertQuery = db('payment_transactions').insert(payload);
      let created;
      if (typeof insertQuery.returning === 'function') {
        created = await insertQuery.returning('*');
      } else {
        created = await insertQuery;
      }

      const transaction = Array.isArray(created) ? created[0] : created;

      // Update outstanding fees
      const fees = await db('fees').where({ student_id: studentId, status: 'pending' }).select('*');
      if (fees.length > 0) {
        const fee = fees[0];
        const newAmount = Math.max(0, fee.amount - amount);
        await db('fees').where({ id: fee.id }).update({
          amount: newAmount,
          status: newAmount === 0 ? 'paid' : 'pending',
        });
      }

      res.status(201).json({
        message: 'Payment processed successfully',
        transaction,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Payment History - Get all transactions for a student
  app.get('/api/fees/:studentId/transactions', authenticateToken, async (req, res) => {
    try {
      const { studentId } = req.params;
      const transactions = await db('payment_transactions')
        .where({ student_id: studentId })
        .orderBy('created_at', 'desc')
        .select('*');
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/timetable/:classId', authenticateToken, async (req, res) => {
    try {
      const rows = await db('timetable').where({ class_id: req.params.classId }).select('*');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/timetable', authenticateToken, async (req, res) => {
    try {
      const allowed = ['teacher', 'admin'];
      if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Permission denied' });
      const [created] = await db('timetable').insert(req.body).returning('*');
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- Attendance summary for UI ---
  app.get('/api/students/:id/attendance', authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
      const rows = await db('attendance').where({ student_id: studentId }).select('*');
      const sorted = Array.isArray(rows)
        ? rows.slice().sort((a, b) => new Date(b.date) - new Date(a.date))
        : rows;
      res.json(sorted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/students/:id/attendance/summary', authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
      const present = await db('attendance').where({ student_id: studentId, status: 'present' }).count('* as cnt').first();
      const absent = await db('attendance').where({ student_id: studentId, status: 'absent' }).count('* as cnt').first();
      const late = await db('attendance').where({ student_id: studentId, status: 'late' }).count('* as cnt').first();
      const total = (present?.cnt || 0) + (absent?.cnt || 0) + (late?.cnt || 0);
      const rate = total > 0 ? Math.round(((present?.cnt || 0) / total) * 100) : 0;
      res.json({ present: present?.cnt || 0, absent: absent?.cnt || 0, late: late?.cnt || 0, rate });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/students/:id/grades/trend', authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
      const grades = await db('grades').where({ student_id: studentId }).select('*');
      const grouped = (Array.isArray(grades) ? grades : []).reduce((acc, row) => {
        const exam = row.exam_name || 'Unknown';
        if (!acc[exam]) acc[exam] = { sum: 0, count: 0 };
        acc[exam].sum += Number(row.score || 0);
        acc[exam].count += 1;
        return acc;
      }, {});
      const trend = Object.keys(grouped)
        .sort()
        .map(exam => ({ examName: exam, average: Math.round(grouped[exam].sum / grouped[exam].count) }));
      res.json(trend);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/students/:id/report', authenticateToken, async (req, res) => {
    try {
      const studentId = req.params.id;
      const student = await db('students').where({ id: studentId }).first();
      if (!student) return res.status(404).json({ message: 'Student not found' });
      const stats = await db('grades').where({ student_id: studentId }).avg('score as average').first();
      const grades = await db('grades').where({ student_id: studentId }).select('*');
      res.json({ student, averageScore: stats?.average || 0, grades });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- Inventory Stats Endpoint ---
  app.get('/api/inventory/stats', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can access inventory stats' });
      }
      const items = await db('inventory_items').select('*');
      const totalItems = items.length;
      const categories = [...new Set(items.map(i => i.category))].length;
      const lowStock = items.filter(i => i.qty < 10).length;
      const available = items.filter(i => i.status === 'In Stock').length;
      res.json({
        totalItems,
        categories,
        lowStock,
        available,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- Fees & Billing Stats Endpoints ---
  app.get('/api/admin/fees/stats', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can access fees stats' });
      }
      const fees = await db('fees').select('*');
      const collected = fees.filter(f => f.status === 'paid' || f.status === 'Paid').length;
      const outstanding = fees.filter(f => f.status === 'pending' || f.status === 'Pending').length;
      const paidInFull = fees.filter(f => f.status === 'paid' || f.status === 'Paid').reduce((sum, f) => sum + Number(f.amount || 0), 0);
      const totalAmount = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
      const growth = totalAmount > 0 ? Math.round((paidInFull / totalAmount) * 100) : 0;

      res.json({
        collected,
        outstanding,
        paidInFull: parseFloat(paidInFull.toFixed(2)),
        'growth%': growth,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/admin/fees/recent', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can access recent fees' });
      }
      const recentFees = await db('fees')
        .join('students', 'fees.student_id', '=', 'students.id')
        .select('fees.*', 'students.name as student_name')
        .orderBy('fees.created_at', 'desc')
        .limit(10);
      res.json(recentFees);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- Attendance Stats Endpoints ---
  app.get('/api/admin/attendance/stats', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can access attendance stats' });
      }
      const attendance = await db('attendance').select('*');
      const present = attendance.filter(a => a.status === 'present' || a.status === 'Present').length;
      const absent = attendance.filter(a => a.status === 'absent' || a.status === 'Absent').length;
      const late = attendance.filter(a => a.status === 'late' || a.status === 'Late').length;
      const total = attendance.length || 1;
      const classAvg = total > 0 ? Math.round((present / total) * 100) : 0;

      res.json({
        present,
        absent,
        late,
        'classAvg%': classAvg,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/admin/attendance/weekly-trend', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can access weekly attendance trend' });
      }
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const attendance = await db('attendance').select('*');

      // Group by day of week
      const trend = days.map((day, index) => {
        const dayRecords = attendance.filter(a => {
          const d = new Date(a.date);
          return d.getDay() === (index + 1) % 7;
        });
        const present = dayRecords.filter(a => a.status === 'present' || a.status === 'Present').length;
        const total = dayRecords.length || 1;
        return {
          day,
          present,
          total,
          percentage: Math.round((present / total) * 100),
        };
      });

      res.json(trend);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- Exams Management Endpoints ---
  app.get('/api/exams', authenticateToken, async (req, res) => {
    try {
      const allExams = await db('exams')
        .join('classes', 'exams.class_id', '=', 'classes.id')
        .select('exams.*', 'classes.name as class_name', 'classes.subject')
        .orderBy('exams.date', 'asc');
      res.json(allExams);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/exam-marks/:examId', authenticateToken, async (req, res) => {
    try {
      const examId = req.params.examId;
      const marks = await db('exam_grades')
        .where({ exam_id: examId })
        .join('students', 'exam_grades.student_id', '=', 'students.id')
        .select('exam_grades.*', 'students.name as student_name')
        .orderBy('students.name', 'asc');
      res.json(marks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/report-cards', authenticateToken, async (req, res) => {
    try {
      const studentId = req.query.studentId;
      let query = db('grades');

      if (studentId) {
        query = query.where({ student_id: studentId });
      }

      const reportCards = await query
        .select('*')
        .orderBy('created_at', 'desc');

      res.json(reportCards);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- Admin Users Management ---
  app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can access user management' });
      }
      const users = await db('users')
        .select('id', 'name', 'email', 'role', 'status', 'created_at')
        .orderBy('created_at', 'desc');
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- School Profile Endpoints ---
  app.get('/api/admin/school-profile', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can access school profile' });
      }
      const profile = await db('school_profile').first();
      if (!profile) {
        return res.json({
          school_name: 'School Management',
          address: '',
          contact_phone: '',
          public_email: '',
          motto_slogan: '',
          system_currency: 'USD',
        });
      }
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/admin/school-profile', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can update school profile' });
      }
      const { schoolName, address, contactPhone, publicEmail, mottoSlogan, systemCurrency } = req.body;
      const existing = await db('school_profile').first();

      let result;
      if (existing) {
        await db('school_profile').update({
          school_name: schoolName,
          address,
          contact_phone: contactPhone,
          public_email: publicEmail,
          motto_slogan: mottoSlogan,
          system_currency: systemCurrency || 'USD',
          updated_at: new Date(),
        });
        result = await db('school_profile').first();
      } else {
        const [id] = await db('school_profile').insert({
          school_name: schoolName,
          address,
          contact_phone: contactPhone,
          public_email: publicEmail,
          motto_slogan: mottoSlogan,
          system_currency: systemCurrency || 'USD',
        });
        result = await db('school_profile').where({ id }).first();
      }
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- System Settings Endpoints ---
  app.get('/api/admin/settings', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can access settings' });
      }
      const settings = await db('system_settings').select('*').orderBy('created_at', 'asc');
      const settingsMap = {};
      settings.forEach(s => {
        settingsMap[s.setting_key] = {
          value: s.setting_value,
          type: s.setting_type,
          description: s.description,
        };
      });
      res.json(settingsMap);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/admin/settings', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can update settings' });
      }
      const { settingKey, settingValue, settingType, description } = req.body;
      const existing = await db('system_settings').where({ setting_key: settingKey }).first();

      let result;
      if (existing) {
        await db('system_settings').where({ setting_key: settingKey }).update({
          setting_value: settingValue,
          setting_type: settingType,
          description,
          updated_at: new Date(),
        });
        result = await db('system_settings').where({ setting_key: settingKey }).first();
      } else {
        const [id] = await db('system_settings').insert({
          setting_key: settingKey,
          setting_value: settingValue,
          setting_type: settingType,
          description,
        });
        result = await db('system_settings').where({ id }).first();
      }
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- Document Generation Endpoints ---
  app.post('/api/admin/generate-document', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Only staff can generate documents' });
      }
      const { studentId, documentType, fileName } = req.body;
      if (!studentId || !documentType) {
        return res.status(400).json({ message: 'studentId and documentType are required' });
      }

      // Verify student exists
      const student = await db('students').where({ id: studentId }).first();
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Generate document record
      const [docId] = await db('generated_documents').insert({
        student_id: studentId,
        document_type: documentType,
        file_name: fileName || `${documentType}_${studentId}_${Date.now()}.pdf`,
        url: `/documents/${studentId}/${documentType}_${Date.now()}.pdf`,
        status: 'generated',
        generated_by: req.user.id,
      });

      const generated = await db('generated_documents').where({ id: docId }).first();

      // Log the action
      await db('audit_logs').insert({
        admin_id: req.user.id,
        admin_name: req.user.name,
        action: 'DOCUMENT_GENERATED',
        entity_type: 'document',
        entity_id: docId,
        description: `Generated ${documentType} for student ${studentId}`,
      });

      res.status(201).json(generated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/admin/documents/recent', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can access recent documents' });
      }
      const recentDocs = await db('generated_documents')
        .join('students', 'generated_documents.student_id', '=', 'students.id')
        .select('generated_documents.*', 'students.name as student_name')
        .orderBy('generated_documents.created_at', 'desc')
        .limit(20);
      res.json(recentDocs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- Audit Logs Endpoints ---
  app.get('/api/admin/audit-logs', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can access audit logs' });
      }
      const limit = req.query.limit || 50;
      const logs = await db('audit_logs')
        .select('*')
        .orderBy('created_at', 'desc')
        .limit(parseInt(limit));
      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // attach helpers for tests
  app._seedInitialData = seedInitialData;

  return app;
}

if (require.main === module) {
  // run with real db when executed directly
  const db = require('./db');
  const app = createApp(db);
  // seed initial data
  app._seedInitialData().catch(err => console.error('Seed failed', err));
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at http://127.0.0.1:${PORT}/api-docs`);
  });
}

module.exports = { createApp };
