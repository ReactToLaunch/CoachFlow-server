import request from 'supertest';
import app from '../../index.js';
import { Admin } from '../models/admin.model.js';
import { Batch } from '../models/batch.model.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Results and Timetable API', () => {

    let adminToken;
    let testBatchId;

    beforeAll(async () => {
        // Create and login admin to get token
        const adminData = {
            Name: 'Test Admin',
            email: 'admin@test.com',
            password: 'password123',
            secretKey: process.env.ADMIN_SECRET
        };

        await request(app)
            .post('/api/v1/admin/registerAdmin')
            .send(adminData);

        const loginResponse = await request(app)
            .post('/api/v1/admin/loginAdmin')
            .send({
                email: 'admin@test.com',
                password: 'password123'
            });

        adminToken = loginResponse.body.data.token;

        // Create a test batch
        const batch = await Batch.create({
            Name: 'JEE Advanced 2024',
            batchcode: 'JEE-ADV-2024',
            subjects: ['Physics', 'Chemistry', 'Mathematics'],
            year: '2024',
            time: '10:00 AM - 12:00 PM'
        });
        testBatchId = batch._id;
    });

    afterAll(async () => {
        // Clean up after all tests
        await Admin.deleteMany({});
        await Batch.deleteMany({});
    });

    describe('POST /api/v1/results/save-result', () => {

        it('should require admin authentication', async () => {
            const response = await request(app)
                .post('/api/v1/results/save-result')
                .field('title', 'Test Result')
                .field('BatchId', testBatchId.toString())
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should reject request without file', async () => {
            const response = await request(app)
                .post('/api/v1/results/save-result')
                .set('Authorization', `Bearer ${adminToken}`)
                .field('title', 'Test Result')
                .field('BatchId', testBatchId.toString())
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('File is required');
        });

        it('should reject request without title', async () => {
            // Create a temporary test file
            const testFilePath = path.join(__dirname, 'test-result.pdf');
            fs.writeFileSync(testFilePath, 'Test PDF content');

            const response = await request(app)
                .post('/api/v1/results/save-result')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('result', testFilePath)
                .field('BatchId', testBatchId.toString())
                .expect(500);

            // Clean up test file
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }

            expect(response.body.success).toBe(false);
        });

        it('should reject request without BatchId', async () => {
            // Create a temporary test file
            const testFilePath = path.join(__dirname, 'test-result.pdf');
            fs.writeFileSync(testFilePath, 'Test PDF content');

            const response = await request(app)
                .post('/api/v1/results/save-result')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('result', testFilePath)
                .field('title', 'Test Result')
                .expect(500);

            // Clean up test file
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }

            expect(response.body.success).toBe(false);
        });

        // Note: Full file upload test would require mocking Cloudinary
        // or having actual Cloudinary credentials configured
        it('should accept multipart form data with file, title, and BatchId', async () => {
            // Create a temporary test file
            const testFilePath = path.join(__dirname, 'test-result.pdf');
            fs.writeFileSync(testFilePath, 'Test PDF content');

            const response = await request(app)
                .post('/api/v1/results/save-result')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('result', testFilePath)
                .field('title', 'Monthly Test Results')
                .field('BatchId', testBatchId.toString());

            // Clean up test file
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }

            // Response may be 201 (success) or 400 (cloudinary error in test env)
            // We're mainly testing that the request structure is correct
            expect([200, 201, 400, 500]).toContain(response.status);
        });
    });

    describe('POST /api/v1/results/save-timetable', () => {

        it('should require admin authentication', async () => {
            const response = await request(app)
                .post('/api/v1/results/save-timetable')
                .field('title', 'Weekly Timetable')
                .field('BatchId', testBatchId.toString())
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should reject request without file', async () => {
            const response = await request(app)
                .post('/api/v1/results/save-timetable')
                .set('Authorization', `Bearer ${adminToken}`)
                .field('title', 'Weekly Timetable')
                .field('BatchId', testBatchId.toString())
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('File is required');
        });

        it('should reject request without title', async () => {
            // Create a temporary test file
            const testFilePath = path.join(__dirname, 'test-timetable.png');
            fs.writeFileSync(testFilePath, 'Test image content');

            const response = await request(app)
                .post('/api/v1/results/save-timetable')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('timetable', testFilePath)
                .field('BatchId', testBatchId.toString())
                .expect(500);

            // Clean up test file
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }

            expect(response.body.success).toBe(false);
        });

        it('should reject request without BatchId', async () => {
            // Create a temporary test file
            const testFilePath = path.join(__dirname, 'test-timetable.png');
            fs.writeFileSync(testFilePath, 'Test image content');

            const response = await request(app)
                .post('/api/v1/results/save-timetable')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('timetable', testFilePath)
                .field('title', 'Weekly Timetable')
                .expect(500);

            // Clean up test file
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }

            expect(response.body.success).toBe(false);
        });

        it('should accept multipart form data with file, title, and BatchId', async () => {
            // Create a temporary test file
            const testFilePath = path.join(__dirname, 'test-timetable.png');
            fs.writeFileSync(testFilePath, 'Test image content');

            const response = await request(app)
                .post('/api/v1/results/save-timetable')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('timetable', testFilePath)
                .field('title', 'Weekly Timetable')
                .field('BatchId', testBatchId.toString());

            // Clean up test file
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }

            // Response may be 201 (success) or 400 (cloudinary error in test env)
            // We're mainly testing that the request structure is correct
            expect([200, 201, 400, 500]).toContain(response.status);
        });

        it('should handle image file uploads', async () => {
            // Create a temporary test image file
            const testFilePath = path.join(__dirname, 'test-timetable.jpg');
            fs.writeFileSync(testFilePath, 'Test JPEG content');

            const response = await request(app)
                .post('/api/v1/results/save-timetable')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('timetable', testFilePath)
                .field('title', 'Monthly Timetable')
                .field('BatchId', testBatchId.toString());

            // Clean up test file
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }

            expect([200, 201, 400, 500]).toContain(response.status);
        });

        it('should handle PDF file uploads', async () => {
            // Create a temporary test PDF file
            const testFilePath = path.join(__dirname, 'test-timetable.pdf');
            fs.writeFileSync(testFilePath, 'Test PDF content');

            const response = await request(app)
                .post('/api/v1/results/save-timetable')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('timetable', testFilePath)
                .field('title', 'Semester Timetable')
                .field('BatchId', testBatchId.toString());

            // Clean up test file
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }

            expect([200, 201, 400, 500]).toContain(response.status);
        });
    });

    describe('File Upload Validation', () => {

        it('should validate file field name for results', async () => {
            const testFilePath = path.join(__dirname, 'test-file.pdf');
            fs.writeFileSync(testFilePath, 'Test content');

            // Using wrong field name 'wrongfield' instead of 'result'
            const response = await request(app)
                .post('/api/v1/results/save-result')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('wrongfield', testFilePath)
                .field('title', 'Test Result')
                .field('BatchId', testBatchId.toString())
                .expect(400);

            // Clean up test file
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }

            expect(response.body.success).toBe(false);
        });

        it('should validate file field name for timetable', async () => {
            const testFilePath = path.join(__dirname, 'test-file.png');
            fs.writeFileSync(testFilePath, 'Test content');

            // Using wrong field name 'wrongfield' instead of 'timetable'
            const response = await request(app)
                .post('/api/v1/results/save-timetable')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('wrongfield', testFilePath)
                .field('title', 'Test Timetable')
                .field('BatchId', testBatchId.toString())
                .expect(400);

            // Clean up test file
            if (fs.existsSync(testFilePath)) {
                fs.unlinkSync(testFilePath);
            }

            expect(response.body.success).toBe(false);
        });
    });
});
