import request from 'supertest';
import app from '../../index.js';
import { User } from '../models/user.model.js';
import { Otp } from '../models/otp.model.js';
import mongoose from 'mongoose';

describe('User/Student Authentication API', () => {

    beforeEach(async () => {
        // Clear user and OTP collections before each test
        await User.deleteMany({});
        await Otp.deleteMany({});
    });

    afterAll(async () => {
        // Clean up after all tests
        await User.deleteMany({});
        await Otp.deleteMany({});
    });

    describe('POST /api/v1/users/register', () => {

        it('should register a new student with valid data', async () => {
            const userData = {
                fullName: 'John Doe',
                email: 'john@test.com',
                phone: '1234567890',
                password: 'pass1234',
                EnrollmentNumber: 'ENR001',
                selectedRole: 'student'
            };

            const response = await request(app)
                .post('/api/v1/users/register')
                .send(userData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User Registered Successfully');
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.user.password).toBeUndefined();
        });

        it('should reject registration with duplicate email', async () => {
            const userData = {
                fullName: 'John Doe',
                email: 'john@test.com',
                phone: '1234567890',
                password: 'pass1234',
                EnrollmentNumber: 'ENR001',
                selectedRole: 'student'
            };

            // First registration
            await request(app)
                .post('/api/v1/users/register')
                .send(userData)
                .expect(200);

            // Attempt duplicate registration
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({ ...userData, EnrollmentNumber: 'ENR002' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User Already Exixt');
        });

        it('should reject registration with duplicate enrollment number', async () => {
            const userData = {
                fullName: 'John Doe',
                email: 'john@test.com',
                phone: '1234567890',
                password: 'pass1234',
                EnrollmentNumber: 'ENR001',
                selectedRole: 'student'
            };

            // First registration
            await request(app)
                .post('/api/v1/users/register')
                .send(userData)
                .expect(200);

            // Attempt duplicate registration with different email
            const response = await request(app)
                .post('/api/v1/users/register')
                .send({ ...userData, email: 'different@test.com' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User Already Exixt');
        });

        it('should reject registration with missing required fields', async () => {
            const userData = {
                fullName: 'John Doe',
                email: 'john@test.com'
                // Missing phone, password, EnrollmentNumber, selectedRole
            };

            const response = await request(app)
                .post('/api/v1/users/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation Error');
        });

        it('should reject registration with invalid email format', async () => {
            const userData = {
                fullName: 'John Doe',
                email: 'invalid-email',
                phone: '1234567890',
                password: 'pass1234',
                EnrollmentNumber: 'ENR001',
                selectedRole: 'student'
            };

            const response = await request(app)
                .post('/api/v1/users/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/users/login', () => {

        beforeEach(async () => {
            // Create a test user before each login test
            const userData = {
                fullName: 'John Doe',
                email: 'john@test.com',
                phone: '1234567890',
                password: 'pass1234',
                EnrollmentNumber: 'ENR001',
                selectedRole: 'student'
            };

            await request(app)
                .post('/api/v1/users/register')
                .send(userData);
        });

        it('should login user with valid email and password', async () => {
            const loginData = {
                email: 'john@test.com',
                EnrollmentNumber: 'ENR001',
                password: 'pass1234'
            };

            const response = await request(app)
                .post('/api/v1/users/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User Logged In Successfully');
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.headers['set-cookie']).toBeDefined();
        });

        it('should reject login with incorrect password', async () => {
            const loginData = {
                email: 'john@test.com',
                EnrollmentNumber: 'ENR001',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/v1/users/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid password');
        });

        it('should reject login with non-existent user', async () => {
            const loginData = {
                email: 'nonexistent@test.com',
                EnrollmentNumber: 'ENR999',
                password: 'pass1234'
            };

            const response = await request(app)
                .post('/api/v1/users/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not registered Please Register First');
        });

        it('should reject login with missing fields', async () => {
            const loginData = {
                email: 'john@test.com'
                // Missing EnrollmentNumber and password
            };

            const response = await request(app)
                .post('/api/v1/users/login')
                .send(loginData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should reject login with empty credentials', async () => {
            const loginData = {
                email: '',
                EnrollmentNumber: '',
                password: ''
            };

            const response = await request(app)
                .post('/api/v1/users/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/users/otp-generate', () => {

        beforeEach(async () => {
            // Create a test user
            const userData = {
                fullName: 'John Doe',
                email: 'john@test.com',
                phone: '1234567890',
                password: 'pass1234',
                EnrollmentNumber: 'ENR001',
                selectedRole: 'student'
            };

            await request(app)
                .post('/api/v1/users/register')
                .send(userData);
        });

        it('should generate OTP for existing user email', async () => {
            const response = await request(app)
                .post('/api/v1/users/otp-generate')
                .send({ email: 'john@test.com' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Email Sent Successfully');

            // Verify OTP was created in database
            const otpRecord = await Otp.findOne({ email: 'john@test.com' });
            expect(otpRecord).toBeDefined();
            expect(otpRecord.otp).toBeDefined();
        });

        it('should reject OTP generation for non-existent email', async () => {
            const response = await request(app)
                .post('/api/v1/users/otp-generate')
                .send({ email: 'nonexistent@test.com' })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User with this email does not exist');
        });

        it('should reject OTP generation without email', async () => {
            const response = await request(app)
                .post('/api/v1/users/otp-generate')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email field is required');
        });
    });

    describe('POST /api/v1/users/verify-otp', () => {

        let testOtp;

        beforeEach(async () => {
            // Create a test user
            const userData = {
                fullName: 'John Doe',
                email: 'john@test.com',
                phone: '1234567890',
                password: 'pass1234',
                EnrollmentNumber: 'ENR001',
                selectedRole: 'student'
            };

            await request(app)
                .post('/api/v1/users/register')
                .send(userData);

            // Generate OTP
            await request(app)
                .post('/api/v1/users/otp-generate')
                .send({ email: 'john@test.com' });

            // Get the OTP from database for testing
            const otpRecord = await Otp.findOne({ email: 'john@test.com' });
            testOtp = otpRecord.otp;
        });

        it('should verify valid OTP', async () => {
            const response = await request(app)
                .post('/api/v1/users/verify-otp')
                .send({
                    email: 'john@test.com',
                    otp: testOtp
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Email Verified Successfully');

            // Verify user is marked as verified
            const user = await User.findOne({ email: 'john@test.com' });
            expect(user.isVerified).toBe(true);

            // Verify OTP is deleted after verification
            const otpRecord = await Otp.findOne({ email: 'john@test.com' });
            expect(otpRecord).toBeNull();
        });

        it('should reject invalid OTP', async () => {
            const response = await request(app)
                .post('/api/v1/users/verify-otp')
                .send({
                    email: 'john@test.com',
                    otp: 'wrongotp'
                })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid OTP');
        });

        it('should reject OTP verification without email or OTP', async () => {
            const response = await request(app)
                .post('/api/v1/users/verify-otp')
                .send({ email: 'john@test.com' })
                .expect(402);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('OTP is required');
        });
    });

    describe('POST /api/v1/users/resetPassword', () => {

        let authToken;
        let testOtp;

        beforeEach(async () => {
            // Create and login a test user
            const userData = {
                fullName: 'John Doe',
                email: 'john@test.com',
                phone: '1234567890',
                password: 'pass1234',
                EnrollmentNumber: 'ENR001',
                selectedRole: 'student'
            };

            await request(app)
                .post('/api/v1/users/register')
                .send(userData);

            const loginResponse = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'john@test.com',
                    EnrollmentNumber: 'ENR001',
                    password: 'pass1234'
                });

            authToken = loginResponse.body.data.accessToken;

            // Generate OTP for password reset
            await request(app)
                .post('/api/v1/users/otp-generate')
                .send({ email: 'john@test.com' });

            const otpRecord = await Otp.findOne({ email: 'john@test.com' });
            testOtp = otpRecord.otp;
        });

        it('should reset password with valid OTP and new password', async () => {
            const response = await request(app)
                .post('/api/v1/users/resetPassword')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'john@test.com',
                    newPassword: 'newpass12',
                    otp: testOtp
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Password reset successful. Please login again.');

            // Verify can login with new password
            const loginResponse = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'john@test.com',
                    EnrollmentNumber: 'ENR001',
                    password: 'newpass12'
                })
                .expect(200);

            expect(loginResponse.body.success).toBe(true);
        });

        it('should require authentication for password reset', async () => {
            const response = await request(app)
                .post('/api/v1/users/resetPassword')
                .send({
                    email: 'john@test.com',
                    newPassword: 'newpass12',
                    otp: testOtp
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should reject password reset with invalid OTP', async () => {
            const response = await request(app)
                .post('/api/v1/users/resetPassword')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'john@test.com',
                    newPassword: 'newpass12',
                    otp: 'wrongotp'
                })
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should reject password reset with missing fields', async () => {
            const response = await request(app)
                .post('/api/v1/users/resetPassword')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'john@test.com',
                    newPassword: 'newpass12'
                    // Missing OTP
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/v1/users/saveToken', () => {

        let authToken;

        beforeEach(async () => {
            // Create and login a test user
            const userData = {
                fullName: 'John Doe',
                email: 'john@test.com',
                phone: '1234567890',
                password: 'pass1234',
                EnrollmentNumber: 'ENR001',
                selectedRole: 'student'
            };

            await request(app)
                .post('/api/v1/users/register')
                .send(userData);

            const loginResponse = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'john@test.com',
                    EnrollmentNumber: 'ENR001',
                    password: 'pass1234'
                });

            authToken = loginResponse.body.data.accessToken;
        });

        it('should save FCM token for authenticated user', async () => {
            const fcmToken = 'test-fcm-token-12345';

            const response = await request(app)
                .put('/api/v1/users/saveToken')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ fcmToken })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Token Saved SuccessFully');
        });

        it('should require authentication to save FCM token', async () => {
            const response = await request(app)
                .put('/api/v1/users/saveToken')
                .send({ fcmToken: 'test-token' })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should reject request without FCM token', async () => {
            const response = await request(app)
                .put('/api/v1/users/saveToken')
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Did not recieve FCM Token');
        });
    });
});
