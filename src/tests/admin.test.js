import request from 'supertest';
import app from '../../index.js';
import { Admin } from '../models/admin.model.js';
import mongoose from 'mongoose';

describe('Admin Authentication API', () => {

    beforeEach(async () => {
        // Clear admin collection before each test
        await Admin.deleteMany({});
    });

    afterAll(async () => {
        // Clean up after all tests
        await Admin.deleteMany({});
    });

    describe('POST /api/v1/admin/registerAdmin', () => {

        it('should register a new admin with valid credentials and secret key', async () => {
            const adminData = {
                Name: 'Test Admin',
                email: 'admin@test.com',
                password: 'password123',
                secretKey: process.env.ADMIN_SECRET
            };

            const response = await request(app)
                .post('/api/v1/admin/registerAdmin')
                .send(adminData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin registered successfully');
            expect(response.body.data.admin).toBeDefined();
            expect(response.body.data.admin.email).toBe(adminData.email);
            expect(response.body.data.admin.password).toBeUndefined(); // Password should not be returned
        });

        it('should reject registration with invalid secret key', async () => {
            const adminData = {
                Name: 'Test Admin',
                email: 'admin@test.com',
                password: 'password123',
                secretKey: 'wrong-secret-key'
            };

            const response = await request(app)
                .post('/api/v1/admin/registerAdmin')
                .send(adminData)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Secret key is not corrrect');
        });

        it('should reject registration with missing fields', async () => {
            const adminData = {
                email: 'admin@test.com',
                password: 'password123'
                // Missing Name and secretKey
            };

            const response = await request(app)
                .post('/api/v1/admin/registerAdmin')
                .send(adminData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation Error');
        });

        it('should reject registration with duplicate email', async () => {
            const adminData = {
                Name: 'Test Admin',
                email: 'admin@test.com',
                password: 'password123',
                secretKey: process.env.ADMIN_SECRET
            };

            // First registration
            await request(app)
                .post('/api/v1/admin/registerAdmin')
                .send(adminData)
                .expect(200);

            // Attempt duplicate registration
            const response = await request(app)
                .post('/api/v1/admin/registerAdmin')
                .send(adminData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Admin already exists');
        });

        it('should reject registration with invalid email format', async () => {
            const adminData = {
                Name: 'Test Admin',
                email: 'invalid-email',
                password: 'password123',
                secretKey: process.env.ADMIN_SECRET
            };

            const response = await request(app)
                .post('/api/v1/admin/registerAdmin')
                .send(adminData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/admin/loginAdmin', () => {

        beforeEach(async () => {
            // Create a test admin before each login test
            const adminData = {
                Name: 'Test Admin',
                email: 'admin@test.com',
                password: 'password123',
                secretKey: process.env.ADMIN_SECRET
            };

            await request(app)
                .post('/api/v1/admin/registerAdmin')
                .send(adminData);
        });

        it('should login admin with valid credentials', async () => {
            const loginData = {
                email: 'admin@test.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/v1/admin/loginAdmin')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Admin logged in successfully');
            expect(response.body.data.admin).toBeDefined();
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.admin.email).toBe(loginData.email);
        });

        it('should reject login with incorrect password', async () => {
            const loginData = {
                email: 'admin@test.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/v1/admin/loginAdmin')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should reject login with non-existent email', async () => {
            const loginData = {
                email: 'nonexistent@test.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/v1/admin/loginAdmin')
                .send(loginData)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Admin not found');
        });

        it('should reject login with missing fields', async () => {
            const loginData = {
                email: 'admin@test.com'
                // Missing password
            };

            const response = await request(app)
                .post('/api/v1/admin/loginAdmin')
                .send(loginData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation Error');
        });

        it('should reject login with empty credentials', async () => {
            const loginData = {
                email: '',
                password: ''
            };

            const response = await request(app)
                .post('/api/v1/admin/loginAdmin')
                .send(loginData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
