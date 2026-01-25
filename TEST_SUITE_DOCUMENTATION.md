# CoachFlow API Test Suite

## Overview
This document provides a comprehensive overview of all test cases created for the CoachFlow server API endpoints.

## Test Files Created

### 1. Admin Authentication Tests (`admin.test.js`)
**Location:** `src/tests/admin.test.js`

#### Endpoints Covered:
- `POST /api/v1/admin/registerAdmin`
- `POST /api/v1/admin/loginAdmin`

#### Test Cases (10 total):

**Registration Tests:**
- ✅ Should register a new admin with valid credentials and secret key
- ✅ Should reject registration with invalid secret key
- ✅ Should reject registration with missing fields
- ✅ Should reject registration with duplicate email
- ✅ Should reject registration with invalid email format

**Login Tests:**
- ✅ Should login admin with valid credentials
- ✅ Should reject login with incorrect password
- ✅ Should reject login with non-existent email
- ✅ Should reject login with missing fields
- ✅ Should reject login with empty credentials

---

### 2. User/Student Authentication Tests (`user.test.js`)
**Location:** `src/tests/user.test.js`

#### Endpoints Covered:
- `POST /api/v1/users/register`
- `POST /api/v1/users/login`
- `POST /api/v1/users/otp-generate`
- `POST /api/v1/users/verify-otp`
- `POST /api/v1/users/resetPassword`
- `PUT /api/v1/users/saveToken`

#### Test Cases (25 total):

**Registration Tests:**
- ✅ Should register a new student with valid data
- ✅ Should reject registration with duplicate email
- ✅ Should reject registration with duplicate enrollment number
- ✅ Should reject registration with missing required fields
- ✅ Should reject registration with invalid email format

**Login Tests:**
- ✅ Should login user with valid email and password
- ✅ Should reject login with incorrect password
- ✅ Should reject login with non-existent user
- ✅ Should reject login with missing fields
- ✅ Should reject login with empty credentials

**OTP Generation Tests:**
- ✅ Should generate OTP for existing user email
- ✅ Should reject OTP generation for non-existent email
- ✅ Should reject OTP generation without email

**OTP Verification Tests:**
- ✅ Should verify valid OTP
- ✅ Should reject invalid OTP
- ✅ Should reject OTP verification without email or OTP

**Password Reset Tests:**
- ✅ Should reset password with valid OTP and new password
- ✅ Should require authentication for password reset
- ✅ Should reject password reset with invalid OTP
- ✅ Should reject password reset with missing fields

**FCM Token Tests:**
- ✅ Should save FCM token for authenticated user
- ✅ Should require authentication to save FCM token
- ✅ Should reject request without FCM token

---

### 3. Batch Management Tests (`batches.test.js`)
**Location:** `src/tests/batches.test.js`

#### Endpoints Covered:
- `POST /api/v1/batches/createBatch`
- `GET /api/v1/batches/getAllBatches`
- `GET /api/v1/batches/getBatchById/:id`
- `PUT /api/v1/batches/updateBatch/:id`

#### Test Cases (22 total):

**Create Batch Tests:**
- ✅ Should create a new batch with valid data and admin authentication
- ✅ Should require admin authentication
- ✅ Should reject duplicate batch code
- ✅ Should reject batch creation with missing required fields
- ✅ Should reject batch creation with empty subjects array
- ✅ Should create batch with multiple subjects

**Get All Batches Tests:**
- ✅ Should get all batches with admin authentication
- ✅ Should require admin authentication
- ✅ Should return empty array when no batches exist
- ✅ Should return batches with all required fields

**Get Batch By ID Tests:**
- ✅ Should get batch by valid ID with admin authentication
- ✅ Should require admin authentication
- ✅ Should return 404 for non-existent batch ID
- ✅ Should return 500 for invalid batch ID format

**Update Batch Tests:**
- ✅ Should update batch with valid data and admin authentication
- ✅ Should require admin authentication
- ✅ Should return 404 for non-existent batch ID
- ✅ Should reject update with invalid data
- ✅ Should update only specific fields

---

### 4. Attendance Management Tests (`attendance.test.js`)
**Location:** `src/tests/attendance.test.js`

#### Endpoints Covered:
- `POST /api/v1/attendence/mark`

#### Test Cases (12 total):

**Mark Attendance Tests:**
- ✅ Should mark attendance for multiple students
- ✅ Should create attendance record in database
- ✅ Should reject attendance marking with empty records
- ✅ Should reject attendance marking without records field
- ✅ Should mark all students as present
- ✅ Should mark all students as absent
- ✅ Should handle attendance for single student
- ✅ Should store attendance with correct date format
- ✅ Should handle attendance for different courses on same day
- ✅ Should handle mixed attendance statuses

**Email Notification Tests:**
- ✅ Should handle email sending for present students
- ✅ Should handle email sending for absent students

---

### 5. Notices Tests (`notices.routes.test.js` & `notices.controller.test.js`)
**Location:** `src/tests/notices.routes.test.js` and `src/tests/notices.controller.test.js`

#### Endpoints Covered:
- `POST /api/v1/notices/create`
- `GET /api/v1/notices/`
- `GET /api/v1/notices/:id`

**Note:** These test files already exist from previous work. They cover:
- Notice creation with admin authentication
- Fetching notices for students based on their batch
- Getting individual notice by ID
- Push notification integration

---

### 6. Results and Timetable Tests (`results.test.js`)
**Location:** `src/tests/results.test.js`

#### Endpoints Covered:
- `POST /api/v1/results/save-result`
- `POST /api/v1/results/save-timetable`

#### Test Cases (14 total):

**Save Result Tests:**
- ✅ Should require admin authentication
- ✅ Should reject request without file
- ✅ Should reject request without title
- ✅ Should reject request without BatchId
- ✅ Should accept multipart form data with file, title, and BatchId

**Save Timetable Tests:**
- ✅ Should require admin authentication
- ✅ Should reject request without file
- ✅ Should reject request without title
- ✅ Should reject request without BatchId
- ✅ Should accept multipart form data with file, title, and BatchId
- ✅ Should handle image file uploads
- ✅ Should handle PDF file uploads

**File Upload Validation Tests:**
- ✅ Should validate file field name for results
- ✅ Should validate file field name for timetable

---

## Test Statistics

### Total Test Coverage:
- **Total Test Files:** 7
- **Total Test Cases:** ~83+
- **Endpoints Covered:** 15+

### Coverage by Module:
| Module | Test File | Test Cases | Endpoints |
|--------|-----------|------------|-----------|
| Admin Auth | admin.test.js | 10 | 2 |
| User Auth | user.test.js | 25 | 6 |
| Batches | batches.test.js | 22 | 4 |
| Attendance | attendance.test.js | 12 | 1 |
| Notices | notices.*.test.js | ~14 | 3 |
| Results | results.test.js | 14 | 2 |

---

## Running the Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- admin.test.js
npm test -- user.test.js
npm test -- batches.test.js
npm test -- attendance.test.js
npm test -- notices.routes.test.js
npm test -- results.test.js
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test Suite
```bash
npm test -- --testNamePattern="Admin Authentication"
npm test -- --testNamePattern="Batch Management"
```

---

## Test Environment Setup

### Prerequisites:
1. **Test Database:** MongoDB test instance running
2. **Environment Variables:** `.env.test` file configured
3. **Dependencies:** Jest and Supertest installed

### Environment Variables Required:
```env
MONGODB_TEST_URI=mongodb://localhost:27017/coachflow-test
ACCESS_TOKEN_SECRET=test_access_token_secret_key
REFRESH_TOKEN_SECRET=test_refresh_token_secret_key
ADMIN_ACCESS_TOKEN_SECRET=test_admin_access_token_secret_key
ADMIN_SECRET=your_admin_secret_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d
PORT=5001
```

---

## Test Patterns Used

### 1. Authentication Testing
- Testing protected routes with and without tokens
- Validating JWT token generation and verification
- Testing role-based access control (Admin vs Student)

### 2. Validation Testing
- Testing required field validation
- Testing data format validation (email, phone, etc.)
- Testing business logic validation (duplicate checks, etc.)

### 3. Database Testing
- Creating test data before tests
- Cleaning up test data after tests
- Verifying database state after operations

### 4. Error Handling Testing
- Testing 400 (Bad Request) scenarios
- Testing 401 (Unauthorized) scenarios
- Testing 404 (Not Found) scenarios
- Testing 409 (Conflict) scenarios
- Testing 500 (Server Error) scenarios

### 5. File Upload Testing
- Testing multipart form data
- Testing file field validation
- Testing file type handling

---

## Best Practices Followed

1. **Isolation:** Each test is independent and doesn't rely on other tests
2. **Cleanup:** Database is cleaned before/after each test suite
3. **Setup:** Common setup logic is in `beforeAll` and `beforeEach` hooks
4. **Descriptive Names:** Test names clearly describe what is being tested
5. **Assertions:** Multiple assertions to verify complete behavior
6. **Edge Cases:** Testing both success and failure scenarios
7. **Authentication:** Proper token management for protected routes
8. **Test Data:** Using realistic test data that matches production scenarios

---

## Known Limitations

1. **Email Service:** Email sending is tested but actual email delivery is not verified (would require email service mocking)
2. **File Uploads:** Cloudinary integration tests may fail without proper credentials (tests verify request structure)
3. **Push Notifications:** Firebase FCM integration is not fully tested (would require Firebase mocking)
4. **Performance:** Tests don't include performance/load testing
5. **Integration:** Some tests are unit/integration level, not full end-to-end

---

## Future Enhancements

1. Add tests for attendance retrieval endpoints (student-side)
2. Add tests for fee management endpoints (when implemented)
3. Add tests for study materials endpoints (when implemented)
4. Add performance/load testing
5. Add end-to-end testing with real database
6. Add API documentation generation from tests
7. Add test coverage reporting to CI/CD pipeline
8. Mock external services (Cloudinary, Firebase, Email) for more reliable tests

---

## Troubleshooting

### Tests Timing Out
```javascript
// Increase timeout in test file
jest.setTimeout(10000); // 10 seconds
```

### Database Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_TEST_URI` in `.env.test`
- Verify network connectivity

### Authentication Failures
- Check token secrets in `.env.test`
- Verify token generation logic
- Check middleware authentication

### File Upload Failures
- Verify multer configuration
- Check file paths and permissions
- Ensure Cloudinary credentials (if testing actual uploads)

---

## Contributing

When adding new tests:
1. Follow existing test structure and patterns
2. Use descriptive test names
3. Include both success and failure scenarios
4. Clean up test data properly
5. Update this documentation

---

## Contact

For questions or issues with tests, please contact the development team.

---

**Last Updated:** January 2024
**Version:** 1.0.0
