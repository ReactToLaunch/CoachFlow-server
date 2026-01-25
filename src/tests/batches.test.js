import request from 'supertest';
import app from '../../index.js';
import { Batch } from '../models/batch.model.js';
import { Admin } from '../models/admin.model.js';
import mongoose from 'mongoose';

describe('Batch Management API', () => {

    let adminToken;

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
    });

    beforeEach(async () => {
        // Clear batch collection before each test
        await Batch.deleteMany({});
    });

    afterAll(async () => {
        // Clean up after all tests
        await Batch.deleteMany({});
        await Admin.deleteMany({});
    });

    describe('POST /api/v1/batches/createBatch', () => {

        it('should create a new batch with valid data and admin authentication', async () => {
            const batchData = {
                Name: 'JEE Advanced 2024',
                batchcode: 'JEE-ADV-2024',
                subjects: ['Physics', 'Chemistry', 'Mathematics'],
                year: '2024',
                time: '10:00 AM - 12:00 PM'
            };

            const response = await request(app)
                .post('/api/v1/batches/createBatch')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(batchData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Batch created successfully');
            expect(response.body.data.batch).toBeDefined();
            expect(response.body.data.batch.Name).toBe(batchData.Name);
            expect(response.body.data.batch.batchcode).toBe(batchData.batchcode);
            expect(response.body.data.batch.subjects).toEqual(batchData.subjects);
        });

        it('should require admin authentication', async () => {
            const batchData = {
                Name: 'JEE Advanced 2024',
                batchcode: 'JEE-ADV-2024',
                subjects: ['Physics', 'Chemistry', 'Mathematics'],
                year: '2024',
                time: '10:00 AM - 12:00 PM'
            };

            const response = await request(app)
                .post('/api/v1/batches/createBatch')
                .send(batchData)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should reject duplicate batch code', async () => {
            const batchData = {
                Name: 'JEE Advanced 2024',
                batchcode: 'JEE-ADV-2024',
                subjects: ['Physics', 'Chemistry', 'Mathematics'],
                year: '2024',
                time: '10:00 AM - 12:00 PM'
            };

            // Create first batch
            await request(app)
                .post('/api/v1/batches/createBatch')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(batchData)
                .expect(200);

            // Attempt to create duplicate
            const response = await request(app)
                .post('/api/v1/batches/createBatch')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(batchData)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Batch with this code already exists');
        });

        it('should reject batch creation with missing required fields', async () => {
            const batchData = {
                Name: 'JEE Advanced 2024',
                batchcode: 'JEE-ADV-2024'
                // Missing subjects, year, time
            };

            const response = await request(app)
                .post('/api/v1/batches/createBatch')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(batchData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation Error');
        });

        it('should reject batch creation with empty subjects array', async () => {
            const batchData = {
                Name: 'JEE Advanced 2024',
                batchcode: 'JEE-ADV-2024',
                subjects: [],
                year: '2024',
                time: '10:00 AM - 12:00 PM'
            };

            const response = await request(app)
                .post('/api/v1/batches/createBatch')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(batchData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should create batch with multiple subjects', async () => {
            const batchData = {
                Name: 'NEET 2024',
                batchcode: 'NEET-2024',
                subjects: ['Physics', 'Chemistry', 'Biology', 'English'],
                year: '2024',
                time: '2:00 PM - 4:00 PM'
            };

            const response = await request(app)
                .post('/api/v1/batches/createBatch')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(batchData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.batch.subjects).toHaveLength(4);
        });
    });

    describe('GET /api/v1/batches/getAllBatches', () => {

        beforeEach(async () => {
            // Create some test batches
            const batches = [
                {
                    Name: 'JEE Advanced 2024',
                    batchcode: 'JEE-ADV-2024',
                    subjects: ['Physics', 'Chemistry', 'Mathematics'],
                    year: '2024',
                    time: '10:00 AM - 12:00 PM'
                },
                {
                    Name: 'NEET 2024',
                    batchcode: 'NEET-2024',
                    subjects: ['Physics', 'Chemistry', 'Biology'],
                    year: '2024',
                    time: '2:00 PM - 4:00 PM'
                },
                {
                    Name: 'Foundation Course',
                    batchcode: 'FOUND-2024',
                    subjects: ['Mathematics', 'Science'],
                    year: '2024',
                    time: '4:00 PM - 6:00 PM'
                }
            ];

            for (const batch of batches) {
                await request(app)
                    .post('/api/v1/batches/createBatch')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(batch);
            }
        });

        it('should get all batches with admin authentication', async () => {
            const response = await request(app)
                .get('/api/v1/batches/getAllBatches')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Batches fetched successfully');
            expect(response.body.data.batches).toBeDefined();
            expect(response.body.data.batches).toHaveLength(3);
        });

        it('should require admin authentication', async () => {
            const response = await request(app)
                .get('/api/v1/batches/getAllBatches')
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should return empty array when no batches exist', async () => {
            // Clear all batches
            await Batch.deleteMany({});

            const response = await request(app)
                .get('/api/v1/batches/getAllBatches')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.batches).toHaveLength(0);
        });

        it('should return batches with all required fields', async () => {
            const response = await request(app)
                .get('/api/v1/batches/getAllBatches')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const batch = response.body.data.batches[0];
            expect(batch).toHaveProperty('Name');
            expect(batch).toHaveProperty('batchcode');
            expect(batch).toHaveProperty('subjects');
            expect(batch).toHaveProperty('year');
            expect(batch).toHaveProperty('time');
            expect(batch).toHaveProperty('_id');
        });
    });

    describe('GET /api/v1/batches/getBatchById/:id', () => {

        let testBatchId;

        beforeEach(async () => {
            // Create a test batch
            const batchData = {
                Name: 'JEE Advanced 2024',
                batchcode: 'JEE-ADV-2024',
                subjects: ['Physics', 'Chemistry', 'Mathematics'],
                year: '2024',
                time: '10:00 AM - 12:00 PM'
            };

            const createResponse = await request(app)
                .post('/api/v1/batches/createBatch')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(batchData);

            testBatchId = createResponse.body.data.batch._id;
        });

        it('should get batch by valid ID with admin authentication', async () => {
            const response = await request(app)
                .get(`/api/v1/batches/getBatchById/${testBatchId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Batch fetched successfully');
            expect(response.body.data.batch).toBeDefined();
            expect(response.body.data.batch._id).toBe(testBatchId);
            expect(response.body.data.batch.Name).toBe('JEE Advanced 2024');
        });

        it('should require admin authentication', async () => {
            const response = await request(app)
                .get(`/api/v1/batches/getBatchById/${testBatchId}`)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should return 404 for non-existent batch ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .get(`/api/v1/batches/getBatchById/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Batch not found');
        });

        it('should return 500 for invalid batch ID format', async () => {
            const response = await request(app)
                .get('/api/v1/batches/getBatchById/invalid-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(500);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/v1/batches/updateBatch/:id', () => {

        let testBatchId;

        beforeEach(async () => {
            // Create a test batch
            const batchData = {
                Name: 'JEE Advanced 2024',
                batchcode: 'JEE-ADV-2024',
                subjects: ['Physics', 'Chemistry', 'Mathematics'],
                year: '2024',
                time: '10:00 AM - 12:00 PM'
            };

            const createResponse = await request(app)
                .post('/api/v1/batches/createBatch')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(batchData);

            testBatchId = createResponse.body.data.batch._id;
        });

        it('should update batch with valid data and admin authentication', async () => {
            const updateData = {
                Name: 'JEE Advanced 2024 - Updated',
                batchcode: 'JEE-ADV-2024',
                subjects: ['Physics', 'Chemistry', 'Mathematics', 'English'],
                year: '2024',
                time: '11:00 AM - 1:00 PM'
            };

            const response = await request(app)
                .put(`/api/v1/batches/updateBatch/${testBatchId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Batch updated successfully');
            expect(response.body.data.updatedBatch.Name).toBe(updateData.Name);
            expect(response.body.data.updatedBatch.time).toBe(updateData.time);
            expect(response.body.data.updatedBatch.subjects).toHaveLength(4);
        });

        it('should require admin authentication', async () => {
            const updateData = {
                Name: 'Updated Name',
                batchcode: 'JEE-ADV-2024',
                subjects: ['Physics'],
                year: '2024',
                time: '11:00 AM - 1:00 PM'
            };

            const response = await request(app)
                .put(`/api/v1/batches/updateBatch/${testBatchId}`)
                .send(updateData)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should return 404 for non-existent batch ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const updateData = {
                Name: 'Updated Name',
                batchcode: 'NEW-CODE',
                subjects: ['Physics'],
                year: '2024',
                time: '11:00 AM - 1:00 PM'
            };

            const response = await request(app)
                .put(`/api/v1/batches/updateBatch/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Batch not found');
        });

        it('should reject update with invalid data', async () => {
            const updateData = {
                Name: 'Updated Name',
                batchcode: 'JEE-ADV-2024',
                subjects: [], // Empty subjects array
                year: '2024',
                time: '11:00 AM - 1:00 PM'
            };

            const response = await request(app)
                .put(`/api/v1/batches/updateBatch/${testBatchId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should update only specific fields', async () => {
            const updateData = {
                Name: 'JEE Advanced 2024',
                batchcode: 'JEE-ADV-2024',
                subjects: ['Physics', 'Chemistry', 'Mathematics'],
                year: '2024',
                time: '3:00 PM - 5:00 PM' // Only changing time
            };

            const response = await request(app)
                .put(`/api/v1/batches/updateBatch/${testBatchId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.updatedBatch.time).toBe('3:00 PM - 5:00 PM');
            expect(response.body.data.updatedBatch.Name).toBe('JEE Advanced 2024');
        });
    });
});
