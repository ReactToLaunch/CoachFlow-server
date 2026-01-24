# Testing Setup Guide for CoachFlow Server

## Prerequisites

This project uses **Jest** as the testing framework and **Supertest** for HTTP assertions.

## Installation

Install the required testing dependencies:

```bash
npm install --save-dev jest supertest @babel/preset-env
```

## Configuration

### 1. Update `package.json`

Add the following to your `package.json`:

```json
{
  "scripts": {
    "test": "NODE_OPTIONS=--experimental-vm-modules jest",
    "test:watch": "NODE_OPTIONS=--experimental-vm-modules jest --watch",
    "test:coverage": "NODE_OPTIONS=--experimental-vm-modules jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": ["/node_modules/"],
    "testMatch": ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
    "transform": {},
    "extensionsToTreatAsEsm": [".js"],
    "moduleNameMapper": {
      "^(\\.{1,2}/.*)\\.js$": "$1"
    }
  }
}
```

### 2. Environment Variables for Testing

Create a `.env.test` file in the root directory:

```env
# Test Database
MONGODB_TEST_URI=mongodb://localhost:27017/coachflow-test

# JWT Secrets (use different secrets for testing)
ACCESS_TOKEN_SECRET=test_access_token_secret_key
REFRESH_TOKEN_SECRET=test_refresh_token_secret_key
ADMIN_ACCESS_TOKEN_SECRET=test_admin_access_token_secret_key

# Token Expiry
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d

# Server Port
PORT=5001
```

### 3. Update `index.js` to Export App

Modify your `index.js` to export the Express app for testing:

```javascript
// At the end of index.js, add:
export default app;
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- notices.controller.test.js
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="should create a new notice"
```

## Test Files Structure

```
src/
├── tests/
│   ├── notices.controller.test.js    # Controller unit/integration tests
│   ├── notices.routes.test.js        # Route integration tests
│   └── setup.js                       # Optional: Global test setup
```

## Writing New Tests

### Basic Test Structure

```javascript
import request from 'supertest';
import app from '../../index.js';

describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup before all tests in this suite
  });

  afterAll(async () => {
    // Cleanup after all tests
  });

  beforeEach(async () => {
    // Setup before each test
  });

  afterEach(async () => {
    // Cleanup after each test
  });

  it('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

## Best Practices

1. **Isolate Tests**: Each test should be independent and not rely on other tests
2. **Clean Database**: Clear test data before/after each test
3. **Use Test Database**: Never run tests against production database
4. **Mock External Services**: Mock Firebase, email services, etc.
5. **Descriptive Names**: Use clear, descriptive test names
6. **Test Edge Cases**: Test both success and failure scenarios
7. **Coverage Goals**: Aim for at least 80% code coverage

## Common Test Patterns

### Testing Protected Routes
```javascript
it('should require authentication', async () => {
  await request(app)
    .get('/api/protected-route')
    .expect(401);
});

it('should allow access with valid token', async () => {
  await request(app)
    .get('/api/protected-route')
    .set('Authorization', `Bearer ${validToken}`)
    .expect(200);
});
```

### Testing Database Operations
```javascript
it('should create a record in database', async () => {
  const data = { name: 'Test' };
  
  const response = await request(app)
    .post('/api/resource')
    .send(data)
    .expect(201);

  const dbRecord = await Model.findById(response.body.data._id);
  expect(dbRecord).toBeDefined();
  expect(dbRecord.name).toBe('Test');
});
```

### Testing Validation
```javascript
it('should reject invalid data', async () => {
  const invalidData = { name: '' }; // Invalid
  
  await request(app)
    .post('/api/resource')
    .send(invalidData)
    .expect(400);
});
```

## Troubleshooting

### Issue: Tests timeout
**Solution**: Increase Jest timeout in test file:
```javascript
jest.setTimeout(10000); // 10 seconds
```

### Issue: Database connection errors
**Solution**: Ensure MongoDB is running and test URI is correct

### Issue: ES Module errors
**Solution**: Ensure `"type": "module"` is in package.json and use proper import syntax

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run tests
  run: npm test
  env:
    MONGODB_TEST_URI: ${{ secrets.MONGODB_TEST_URI }}
    ACCESS_TOKEN_SECRET: ${{ secrets.ACCESS_TOKEN_SECRET }}
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
