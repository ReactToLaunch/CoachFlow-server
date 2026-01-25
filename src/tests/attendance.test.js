import request from 'supertest';
import app from '../../index.js';
import { Attendance } from '../models/attendence.model.js';
import { User } from '../models/user.model.js';
import { Batch } from '../models/batch.model.js';
import mongoose from 'mongoose';

describe('Attendance Management API', () => {

    let testStudentIds = [];
    let testBatchId;

    beforeAll(async () => {
        // Create a test batch
        const batch = await Batch.create({
            Name: 'JEE Advanced 2024',
            batchcode: 'JEE-ADV-2024',
            subjects: ['Physics', 'Chemistry', 'Mathematics'],
            year: '2024',
            time: '10:00 AM - 12:00 PM'
        });
        testBatchId = batch._id;

        // Create test students
        const students = [
            {
                fullName: 'Student One',
                email: 'student1@test.com',
                phone: '1234567890',
                password: 'pass1234',
                EnrollmentNumber: 'ENR001',
                selectedRole: 'student'
            },
            {
                fullName: 'Student Two',
                email: 'student2@test.com',
                phone: '1234567891',
                password: 'pass1234',
                EnrollmentNumber: 'ENR002',
                selectedRole: 'student'
            },
            {
                fullName: 'Student Three',
                email: 'student3@test.com',
                phone: '1234567892',
                password: 'pass1234',
                EnrollmentNumber: 'ENR003',
                selectedRole: 'student'
            }
        ];

        for (const studentData of students) {
            const student = await User.create(studentData);
            testStudentIds.push(student._id);
        }
    });

    beforeEach(async () => {
        // Clear attendance records before each test
        await Attendance.deleteMany({});
    });

    afterAll(async () => {
        // Clean up after all tests
        await Attendance.deleteMany({});
        await User.deleteMany({});
        await Batch.deleteMany({});
    });

    describe('POST /api/v1/attendence/mark', () => {

        it('should mark attendance for multiple students', async () => {
            const attendanceData = {
                date: new Date().toISOString().split('T')[0],
                courseId: 'Physics',
                records: [
                    { studentId: testStudentIds[0].toString(), status: 'PRESENT' },
                    { studentId: testStudentIds[1].toString(), status: 'PRESENT' },
                    { studentId: testStudentIds[2].toString(), status: 'ABSENT' }
                ]
            };

            const response = await request(app)
                .post('/api/v1/attendence/mark')
                .send(attendanceData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Attendance marked and emails sent successfully');
            expect(response.body.data).toBeDefined();
            expect(response.body.data.records).toHaveLength(3);
            expect(response.body.data.courseId).toBe('Physics');
        });

        it('should create attendance record in database', async () => {
            const attendanceData = {
                date: new Date().toISOString().split('T')[0],
                courseId: 'Chemistry',
                records: [
                    { studentId: testStudentIds[0].toString(), status: 'PRESENT' },
                    { studentId: testStudentIds[1].toString(), status: 'ABSENT' }
                ]
            };

            await request(app)
                .post('/api/v1/attendence/mark')
                .send(attendanceData)
                .expect(200);

            // Verify record was created in database
            const dbRecord = await Attendance.findOne({ courseId: 'Chemistry' });
            expect(dbRecord).toBeDefined();
            expect(dbRecord.records).toHaveLength(2);
            expect(dbRecord.date).toBeDefined();
        });

        it('should reject attendance marking with empty records', async () => {
            const attendanceData = {
                date: new Date().toISOString().split('T')[0],
                courseId: 'Physics',
                records: []
            };

            const response = await request(app)
                .post('/api/v1/attendence/mark')
                .send(attendanceData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('No attendance records provided');
        });

        it('should reject attendance marking without records field', async () => {
            const attendanceData = {
                date: new Date().toISOString().split('T')[0],
                courseId: 'Physics'
                // Missing records
            };

            const response = await request(app)
                .post('/api/v1/attendence/mark')
                .send(attendanceData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('No attendance records provided');
        });

        it('should mark all students as present', async () => {
            const attendanceData = {
                date: new Date().toISOString().split('T')[0],
                courseId: 'Mathematics',
                records: [
                    { studentId: testStudentIds[0].toString(), status: 'PRESENT' },
                    { studentId: testStudentIds[1].toString(), status: 'PRESENT' },
                    { studentId: testStudentIds[2].toString(), status: 'PRESENT' }
                ]
            };

            const response = await request(app)
                .post('/api/v1/attendence/mark')
                .send(attendanceData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.records.every(r => r.status === 'PRESENT')).toBe(true);
        });

        it('should mark all students as absent', async () => {
            const attendanceData = {
                date: new Date().toISOString().split('T')[0],
                courseId: 'Biology',
                records: [
                    { studentId: testStudentIds[0].toString(), status: 'ABSENT' },
                    { studentId: testStudentIds[1].toString(), status: 'ABSENT' },
                    { studentId: testStudentIds[2].toString(), status: 'ABSENT' }
                ]
            };

            const response = await request(app)
                .post('/api/v1/attendence/mark')
                .send(attendanceData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.records.every(r => r.status === 'ABSENT')).toBe(true);
        });

        it('should handle attendance for single student', async () => {
            const attendanceData = {
                date: new Date().toISOString().split('T')[0],
                courseId: 'English',
                records: [
                    { studentId: testStudentIds[0].toString(), status: 'PRESENT' }
                ]
            };

            const response = await request(app)
                .post('/api/v1/attendence/mark')
                .send(attendanceData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.records).toHaveLength(1);
        });

        it('should store attendance with correct date format', async () => {
            const testDate = '2024-01-15';
            const attendanceData = {
                date: testDate,
                courseId: 'Physics',
                records: [
                    { studentId: testStudentIds[0].toString(), status: 'PRESENT' }
                ]
            };

            await request(app)
                .post('/api/v1/attendence/mark')
                .send(attendanceData)
                .expect(200);

            const dbRecord = await Attendance.findOne({ courseId: 'Physics' });
            expect(dbRecord.date).toBeDefined();
        });

        it('should handle attendance for different courses on same day', async () => {
            const date = new Date().toISOString().split('T')[0];

            // Mark attendance for Physics
            await request(app)
                .post('/api/v1/attendence/mark')
                .send({
                    date,
                    courseId: 'Physics',
                    records: [{ studentId: testStudentIds[0].toString(), status: 'PRESENT' }]
                })
                .expect(200);

            // Mark attendance for Chemistry
            await request(app)
                .post('/api/v1/attendence/mark')
                .send({
                    date,
                    courseId: 'Chemistry',
                    records: [{ studentId: testStudentIds[0].toString(), status: 'ABSENT' }]
                })
                .expect(200);

            // Verify both records exist
            const physicsRecord = await Attendance.findOne({ courseId: 'Physics' });
            const chemistryRecord = await Attendance.findOne({ courseId: 'Chemistry' });

            expect(physicsRecord).toBeDefined();
            expect(chemistryRecord).toBeDefined();
            expect(physicsRecord.records[0].status).toBe('PRESENT');
            expect(chemistryRecord.records[0].status).toBe('ABSENT');
        });

        it('should handle mixed attendance statuses', async () => {
            const attendanceData = {
                date: new Date().toISOString().split('T')[0],
                courseId: 'Mixed Course',
                records: [
                    { studentId: testStudentIds[0].toString(), status: 'PRESENT' },
                    { studentId: testStudentIds[1].toString(), status: 'ABSENT' },
                    { studentId: testStudentIds[2].toString(), status: 'PRESENT' }
                ]
            };

            const response = await request(app)
                .post('/api/v1/attendence/mark')
                .send(attendanceData)
                .expect(200);

            expect(response.body.success).toBe(true);

            const presentCount = response.body.data.records.filter(r => r.status === 'PRESENT').length;
            const absentCount = response.body.data.records.filter(r => r.status === 'ABSENT').length;

            expect(presentCount).toBe(2);
            expect(absentCount).toBe(1);
        });
    });

    describe('Attendance Email Notifications', () => {

        it('should handle email sending for present students', async () => {
            const attendanceData = {
                date: new Date().toISOString().split('T')[0],
                courseId: 'Physics',
                records: [
                    { studentId: testStudentIds[0].toString(), status: 'PRESENT' }
                ]
            };

            // This test verifies the endpoint completes successfully
            // Email sending is mocked/handled by the email service
            const response = await request(app)
                .post('/api/v1/attendence/mark')
                .send(attendanceData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('emails sent');
        });

        it('should handle email sending for absent students', async () => {
            const attendanceData = {
                date: new Date().toISOString().split('T')[0],
                courseId: 'Chemistry',
                records: [
                    { studentId: testStudentIds[0].toString(), status: 'ABSENT' }
                ]
            };

            const response = await request(app)
                .post('/api/v1/attendence/mark')
                .send(attendanceData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('emails sent');
        });
    });
});
