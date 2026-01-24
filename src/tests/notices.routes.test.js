/**
 * Batch Model Tests
 * 
 * Tests for the Batch model and batch-related operations
 */

import mongoose from 'mongoose';
import { Batch } from '../models/batch.model.js';
import { StudentProfile } from '../models/studentProfile.js';
import { User } from '../models/user.model.js';

describe('Batch and Student Profile Tests', () => {
    beforeEach(async () => {
        await Batch.deleteMany({});
        await StudentProfile.deleteMany({});
        await User.deleteMany({});
    });

    describe('Batch Creation', () => {
        it('should create a batch with valid data', async () => {
            const batch = await Batch.create({
                Name: 'Test Batch',
                batchcode: 'TEST-001',
                subjects: ['Math', 'Science'],
                year: 2024,
                time: '9:00 AM - 12:00 PM',
                isActive: true
            });

            expect(batch).toBeDefined();
            expect(batch.Name).toBe('Test Batch');
            expect(batch.batchcode).toBe('TEST-001');
            expect(batch.subjects).toHaveLength(2);
        });

        it('should require batch code to be unique', async () => {
            await Batch.create({
                Name: 'Batch 1',
                batchcode: 'DUPLICATE',
                subjects: ['Math'],
                year: 2024,
                time: '9:00 AM'
            });

            await expect(
                Batch.create({
                    Name: 'Batch 2',
                    batchcode: 'DUPLICATE',
                    subjects: ['Science'],
                    year: 2024,
                    time: '10:00 AM'
                })
            ).rejects.toThrow();
        });

        it('should convert batch code to uppercase', async () => {
            const batch = await Batch.create({
                Name: 'Test Batch',
                batchcode: 'lowercase-code',
                subjects: ['Math'],
                year: 2024,
                time: '9:00 AM'
            });

            expect(batch.batchcode).toBe('LOWERCASE-CODE');
        });
    });

    describe('Student Profile and Batch Association', () => {
        let batch;
        let user;

        beforeEach(async () => {
            batch = await Batch.create({
                Name: 'Test Batch',
                batchcode: 'BATCH-001',
                subjects: ['Math', 'Science'],
                year: 2024,
                time: '9:00 AM - 12:00 PM'
            });

            user = await User.create({
                fullName: 'Test Student',
                EnrollmentNumber: 'ENR001',
                email: 'student@test.com',
                password: 'password123',
                phone: '1234567890',
                selectedRole: 'student',
                isVerified: true
            });
        });

        it('should create a student profile with batch reference', async () => {
            const profile = await StudentProfile.create({
                user: user._id,
                batch: batch._id,
                admissionNumber: 'ADM001',
                rollNumber: 'ROLL001',
                parentsName: 'Parent Name',
                parentsPhone: '9876543210',
                gender: 'Male'
            });

            expect(profile).toBeDefined();
            expect(profile.batch.toString()).toBe(batch._id.toString());
        });

        it('should populate batch details in student profile', async () => {
            await StudentProfile.create({
                user: user._id,
                batch: batch._id,
                admissionNumber: 'ADM001',
                rollNumber: 'ROLL001',
                parentsName: 'Parent Name',
                parentsPhone: '9876543210',
                gender: 'Male'
            });

            const profile = await StudentProfile.findOne({ user: user._id })
                .populate('batch', 'Name batchcode');

            expect(profile.batch.Name).toBe('Test Batch');
            expect(profile.batch.batchcode).toBe('BATCH-001');
        });

        it('should find student profile by user ID', async () => {
            await StudentProfile.create({
                user: user._id,
                batch: batch._id,
                admissionNumber: 'ADM001',
                rollNumber: 'ROLL001',
                parentsName: 'Parent Name',
                parentsPhone: '9876543210',
                gender: 'Male'
            });

            const profile = await StudentProfile.findOne({ user: user._id });
            expect(profile).toBeDefined();
            expect(profile.user.toString()).toBe(user._id.toString());
        });
    });

    describe('User Model Tests', () => {
        it('should create a user with hashed password', async () => {
            const plainPassword = 'testpassword123';
            const user = await User.create({
                fullName: 'Test User',
                EnrollmentNumber: 'ENR002',
                email: 'user@test.com',
                password: plainPassword,
                phone: '1234567890',
                selectedRole: 'student'
            });

            expect(user.password).not.toBe(plainPassword);
            expect(user.password.length).toBeGreaterThan(plainPassword.length);
        });

        it('should validate correct password', async () => {
            const plainPassword = 'correctpassword';
            const user = await User.create({
                fullName: 'Test User',
                EnrollmentNumber: 'ENR003',
                email: 'user2@test.com',
                password: plainPassword,
                phone: '1234567891',
                selectedRole: 'student'
            });

            const isValid = await user.validatePassword(plainPassword);
            expect(isValid).toBe(true);
        });

        it('should generate access token', () => {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                fullName: 'Token Test User',
                email: 'tokentest@test.com'
            });

            const token = user.generateAccessToken();
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });
    });
});
