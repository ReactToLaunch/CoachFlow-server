# Quick Test Reference Guide

## 🚀 Quick Start

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
# Admin tests
npm test -- admin.test.js

# User/Student tests
npm test -- user.test.js

# Batch management tests
npm test -- batches.test.js

# Attendance tests
npm test -- attendance.test.js

# Notice tests
npm test -- notices.routes.test.js
npm test -- notices.controller.test.js

# Results tests
npm test -- results.test.js
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

---

## 📋 Test Files Overview

| File | Endpoints Tested | Test Count |
|------|-----------------|------------|
| `admin.test.js` | Admin registration & login | 10 |
| `user.test.js` | Student auth, OTP, password reset, FCM | 25 |
| `batches.test.js` | Batch CRUD operations | 22 |
| `attendance.test.js` | Mark attendance | 12 |
| `notices.routes.test.js` | Notice routes | ~7 |
| `notices.controller.test.js` | Notice controllers | ~7 |
| `results.test.js` | Results & timetable upload | 14 |

**Total: ~97 test cases covering 15+ endpoints**

---

## 🎯 What Each Test File Covers

### `admin.test.js`
- ✅ Admin registration with secret key
- ✅ Admin login
- ✅ Validation errors
- ✅ Duplicate prevention

### `user.test.js`
- ✅ Student registration
- ✅ Student login
- ✅ OTP generation
- ✅ OTP verification
- ✅ Password reset
- ✅ FCM token saving

### `batches.test.js`
- ✅ Create batch (admin only)
- ✅ Get all batches
- ✅ Get batch by ID
- ✅ Update batch
- ✅ Admin authentication

### `attendance.test.js`
- ✅ Mark attendance for students
- ✅ Present/Absent status
- ✅ Email notifications
- ✅ Multiple courses per day

### `notices.routes.test.js` & `notices.controller.test.js`
- ✅ Create notice (admin)
- ✅ Get notices (student)
- ✅ Get notice by ID
- ✅ Batch-specific notices

### `results.test.js`
- ✅ Upload result files
- ✅ Upload timetable files
- ✅ File validation
- ✅ Admin authentication

---

## ⚙️ Environment Setup

Make sure `.env.test` exists with:
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

## 🔍 Common Test Commands

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="should register"
npm test -- --testNamePattern="authentication"
```

### Run tests for a specific describe block
```bash
npm test -- --testNamePattern="Admin Authentication"
npm test -- --testNamePattern="Batch Management"
```

### Run tests with verbose output
```bash
npm test -- --verbose
```

### Run tests and update snapshots
```bash
npm test -- --updateSnapshot
```

---

## 🐛 Troubleshooting

### Tests are failing with database errors
- Make sure MongoDB is running
- Check `MONGODB_TEST_URI` in `.env.test`
- Try: `mongod --dbpath /path/to/test/db`

### Tests timeout
- Increase timeout in `package.json` jest config
- Or add to specific test: `jest.setTimeout(10000)`

### Authentication errors
- Verify `.env.test` has all required secrets
- Check that tokens are being generated correctly

### File upload tests failing
- These may fail without Cloudinary credentials
- Tests verify request structure, not actual upload

---

## 📊 Test Coverage

To see detailed coverage report:
```bash
npm run test:coverage
```

This will show:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

Coverage reports are generated in `coverage/` directory.

---

## ✅ All API Endpoints Tested

### Authentication
- `POST /api/v1/admin/registerAdmin` ✅
- `POST /api/v1/admin/loginAdmin` ✅
- `POST /api/v1/users/register` ✅
- `POST /api/v1/users/login` ✅

### User Management
- `POST /api/v1/users/otp-generate` ✅
- `POST /api/v1/users/verify-otp` ✅
- `POST /api/v1/users/resetPassword` ✅
- `PUT /api/v1/users/saveToken` ✅

### Batch Management
- `POST /api/v1/batches/createBatch` ✅
- `GET /api/v1/batches/getAllBatches` ✅
- `GET /api/v1/batches/getBatchById/:id` ✅
- `PUT /api/v1/batches/updateBatch/:id` ✅

### Attendance
- `POST /api/v1/attendence/mark` ✅

### Notices
- `POST /api/v1/notices/create` ✅
- `GET /api/v1/notices/` ✅
- `GET /api/v1/notices/:id` ✅

### Results & Timetable
- `POST /api/v1/results/save-result` ✅
- `POST /api/v1/results/save-timetable` ✅

---

## 📝 Notes

- All tests are isolated and independent
- Database is cleaned before/after each test suite
- Tests use realistic data that matches production
- Both success and failure scenarios are tested
- Authentication is properly tested for protected routes

---

For detailed documentation, see `TEST_SUITE_DOCUMENTATION.md`
