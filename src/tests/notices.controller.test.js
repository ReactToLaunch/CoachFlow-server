/**
 * Notice Controller Unit Tests
 * 
 * These tests verify the notice controller functions work correctly.
 * Note: These are simplified tests. For full integration tests with the Express app,
 * you'll need to ensure all models and dependencies are properly set up.
 */

import mongoose from 'mongoose';
import { Notice } from '../models/notice.model.js';
import { Batch } from '../models/batch.model.js';
import { Admin } from '../models/admin.model.js';

describe('Notice Model and Database Tests', () => {
    let batch1;
    let batch2;
    let adminUser;

    beforeEach(async () => {
        // Clear collections before each test
        await Notice.deleteMany({});
        await Batch.deleteMany({});
        await Admin.deleteMany({});

        // Create test batches
        batch1 = await Batch.create({
            Name: 'Batch A',
            batchcode: 'BATCH-A',
            subjects: ['Math', 'Science'],
            year: 2024,
            time: '9:00 AM - 12:00 PM',
            isActive: true
        });

        batch2 = await Batch.create({
            Name: 'Batch B',
            batchcode: 'BATCH-B',
            subjects: ['English', 'History'],
            year: 2024,
            time: '1:00 PM - 4:00 PM',
            isActive: true
        });

        // Create test admin
        adminUser = await Admin.create({
            Name: 'Test Admin',
            email: 'admin@test.com',
            password: 'adminpass123'
        });
    });

    describe('Notice Creation', () => {
        it('should create a notice for a specific batch', async () => {
            const notice = await Notice.create({
                title: 'Test Notice',
                content: 'This is a test notice',
                type: 'INFO',
                targetBatches: [batch1._id],
                postedBy: adminUser._id
            });

            expect(notice).toBeDefined();
            expect(notice.title).toBe('Test Notice');
            expect(notice.content).toBe('This is a test notice');
            expect(notice.type).toBe('INFO');
            expect(notice.targetBatches).toHaveLength(1);
            expect(notice.targetBatches[0].toString()).toBe(batch1._id.toString());
        });

        it('should create a notice for all batches', async () => {
            const notice = await Notice.create({
                title: 'General Notice',
                content: 'This is for all batches',
                type: 'URGENT',
                targetBatches: ['All'],
                postedBy: adminUser._id
            });

            expect(notice).toBeDefined();
            expect(notice.targetBatches).toContain('All');
        });

        it('should create a notice with multiple target batches', async () => {
            const notice = await Notice.create({
                title: 'Multi-Batch Notice',
                content: 'This is for multiple batches',
                type: 'INFO',
                targetBatches: [batch1._id, batch2._id],
                postedBy: adminUser._id
            });

            expect(notice.targetBatches).toHaveLength(2);
        });

        it('should require title and content', async () => {
            await expect(
                Notice.create({
                    type: 'INFO',
                    targetBatches: [batch1._id],
                    postedBy: adminUser._id
                })
            ).rejects.toThrow();
        });

        it('should only accept valid notice types', async () => {
            await expect(
                Notice.create({
                    title: 'Invalid Type Notice',
                    content: 'Testing invalid type',
                    type: 'INVALID_TYPE',
                    targetBatches: [batch1._id],
                    postedBy: adminUser._id
                })
            ).rejects.toThrow();
        });
    });

    describe('Notice Retrieval and Filtering', () => {
        beforeEach(async () => {
            // Create test notices
            await Notice.create({
                title: 'Notice for Batch A',
                content: 'Content for Batch A',
                type: 'INFO',
                targetBatches: [batch1._id],
                postedBy: adminUser._id
            });

            await Notice.create({
                title: 'Notice for Batch B',
                content: 'Content for Batch B',
                type: 'URGENT',
                targetBatches: [batch2._id],
                postedBy: adminUser._id
            });

            await Notice.create({
                title: 'General Notice',
                content: 'Content for all',
                type: 'HOLIDAY',
                targetBatches: ['All'],
                postedBy: adminUser._id
            });
        });

        it('should retrieve notices for a specific batch', async () => {
            const notices = await Notice.find({
                $or: [
                    { targetBatches: batch1._id },
                    { targetBatches: 'All' }
                ]
            });

            expect(notices).toHaveLength(2);
            const titles = notices.map(n => n.title);
            expect(titles).toContain('Notice for Batch A');
            expect(titles).toContain('General Notice');
            expect(titles).not.toContain('Notice for Batch B');
        });

        it('should retrieve all notices marked as "All"', async () => {
            const notices = await Notice.find({
                targetBatches: 'All'
            });

            expect(notices).toHaveLength(1);
            expect(notices[0].title).toBe('General Notice');
        });

        it('should sort notices by creation date', async () => {
            const notices = await Notice.find({}).sort({ createdAt: -1 });

            expect(notices).toHaveLength(3);
            // Verify they're sorted (newest first)
            for (let i = 0; i < notices.length - 1; i++) {
                expect(notices[i].createdAt >= notices[i + 1].createdAt).toBe(true);
            }
        });

        it('should populate admin details', async () => {
            const notice = await Notice.findOne({ title: 'Notice for Batch A' })
                .populate('postedBy', 'Name email');

            expect(notice.postedBy).toBeDefined();
            expect(notice.postedBy.Name).toBe('Test Admin');
            expect(notice.postedBy.email).toBe('admin@test.com');
            expect(notice.postedBy.password).toBeUndefined();
        });

        it('should populate batch details', async () => {
            const notice = await Notice.findOne({ title: 'Notice for Batch A' })
                .populate('targetBatches', 'Name batchcode');

            expect(notice.targetBatches).toHaveLength(1);
            expect(notice.targetBatches[0].Name).toBe('Batch A');
            expect(notice.targetBatches[0].batchcode).toBe('BATCH-A');
        });
    });

    describe('Notice Updates and Deletion', () => {
        it('should update a notice', async () => {
            const notice = await Notice.create({
                title: 'Original Title',
                content: 'Original content',
                type: 'INFO',
                targetBatches: [batch1._id],
                postedBy: adminUser._id
            });

            notice.title = 'Updated Title';
            notice.content = 'Updated content';
            await notice.save();

            const updated = await Notice.findById(notice._id);
            expect(updated.title).toBe('Updated Title');
            expect(updated.content).toBe('Updated content');
        });

        it('should delete a notice', async () => {
            const notice = await Notice.create({
                title: 'To Be Deleted',
                content: 'This will be deleted',
                type: 'INFO',
                targetBatches: [batch1._id],
                postedBy: adminUser._id
            });

            await Notice.findByIdAndDelete(notice._id);

            const deleted = await Notice.findById(notice._id);
            expect(deleted).toBeNull();
        });
    });

    describe('Admin Model Tests', () => {
        it('should generate access token', () => {
            const token = adminUser.generateAccessToken();
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);
        });

        it('should hash password on save', async () => {
            const plainPassword = 'testpassword123';
            const newAdmin = await Admin.create({
                Name: 'New Admin',
                email: 'newadmin@test.com',
                password: plainPassword
            });

            expect(newAdmin.password).not.toBe(plainPassword);
            expect(newAdmin.password.length).toBeGreaterThan(plainPassword.length);
        });

        it('should validate correct password', async () => {
            const plainPassword = 'correctpassword';
            const admin = await Admin.create({
                Name: 'Password Test Admin',
                email: 'passtest@test.com',
                password: plainPassword
            });

            const isValid = await admin.validatePassword(plainPassword);
            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const admin = await Admin.create({
                Name: 'Password Test Admin 2',
                email: 'passtest2@test.com',
                password: 'correctpassword'
            });

            const isValid = await admin.validatePassword('wrongpassword');
            expect(isValid).toBe(false);
        });
    });
});
