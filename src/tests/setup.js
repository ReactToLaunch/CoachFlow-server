import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';

    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/coachflow-test';

    await mongoose.connect(mongoUri);
});

// Global test teardown
afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
});
