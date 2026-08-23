# CoachFlow

A production-grade RESTful API backend for managing coaching institute operations — built with **Node.js**, **Express.js**, and **MongoDB**.

CoachFlow streamlines student enrollment, batch management, fee collection, attendance tracking, notice broadcasting, study material distribution, and result management into a single, secure API server.

---

## Table of Contents

- [Key Highlights](#key-highlights)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Security](#security)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Environment Variables](#environment-variables)

---

## Key Highlights

- **Role-Based Access Control** — Separate JWT authentication for Students/Teachers and Admins with protected route middleware
- **Two-Factor Authentication** — OTP-based 2FA flow for admin login via email (Brevo/Sendinblue API)
- **Fee Management Engine** — Automated payment tracking, ledger generation, defaulter detection, and PDF receipt generation via PDFKit
- **Attendance System** — Batch-wise daily attendance with unique compound index prevention, parent email notifications
- **Push Notifications** — Firebase Cloud Messaging (FCM) integration for real-time notice delivery
- **File Uploads & Cloud Storage** — Multer + Cloudinary for study material, results, and timetable uploads
- **Input Validation & Sanitization** — Zod schemas for request validation, `sanitize-html` for XSS prevention, `express-mongo-sanitize` for NoSQL injection protection
- **Automated Email Service** — Brevo API integration for OTP delivery, fee receipts, and attendance reports with PDF attachments
- **Dashboard Analytics** — Aggregated stats endpoint for coaching institute overview

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **Validation** | Zod |
| **File Upload** | Multer + Cloudinary |
| **Push Notifications** | Firebase Admin SDK (FCM) |
| **Email Service** | Brevo (Sendinblue) API via Axios |
| **PDF Generation** | PDFKit |
| **Security** | Helmet, CORS, HPP, express-rate-limit, express-mongo-sanitize |
| **Testing** | Jest + Supertest |
| **Linting** | ESLint + Prettier |

---

## Architecture

```
CoachFlow-server/
├── index.js                    # Express app entry point & route mounting
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── fireBase.js         # Firebase Admin SDK setup
│   ├── models/                 # Mongoose schemas (12 models)
│   │   ├── user.model.js       # Student/Teacher
│   │   ├── admin.model.js      # Admin
│   │   ├── batch.model.js      # Batch
│   │   ├── attendence.model.js # Attendance
│   │   ├── fees.model.js       # Fees & transactions
│   │   ├── notice.model.js     # Notices
│   │   ├── result.model.js     # Results
│   │   ├── studyMaterial.model.js
│   │   ├── timetable.model.js
│   │   ├── otp.model.js        # OTP with TTL index
│   │   ├── pendingAuth.model.js
│   │   └── studentProfile.js
│   ├── controllers/            # Business logic (9 controllers)
│   ├── routes/                 # API route definitions (10 route files)
│   ├── middlewares/            # Auth, error handling, file upload, sanitization
│   ├── validations/            # Zod schemas for request validation
│   ├── utils/                  # Helpers (Cloudinary, OTP, email, PDF, seeding)
│   └── tests/                  # Jest test suites
├── Api-Collections/            # Requestly API collections for testing
└── public/temp/                # Temporary file storage
```

---

## API Endpoints

### Authentication — Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users/register` | Register student/teacher |
| `POST` | `/api/v1/users/login` | Login with email or enrollment number |
| `POST` | `/api/v1/users/resetPassword` | Reset password via OTP |
| `POST` | `/api/v1/users/generateotp` | Generate & send OTP to email |
| `POST` | `/api/v1/users/verify` | Verify OTP for account activation |
| `PUT` | `/api/v1/users/saveToken` | Save FCM push notification token |

### Authentication — Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/admin/registerAdmin` | Register admin (requires secret key) |
| `POST` | `/api/v1/admin/loginAdmin` | Admin login |
| `POST` | `/api/v1/admin/generate-otp` | Generate OTP for 2FA |
| `POST` | `/api/v1/admin/verify-otp` | Verify OTP & issue token |
| `POST` | `/api/v1/admin/logout` | Clear admin session |

### Batch Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/batches/createBatch` | Create a new batch |
| `GET` | `/api/v1/batches/getAllBatches` | List all batches |
| `GET` | `/api/v1/batches/getBatchById/:id` | Get batch details |
| `PUT` | `/api/v1/batches/updateBatch/:id` | Update batch info |

### Notices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/notices/create` | Create a notice |
| `GET` | `/api/v1/notices/getNotices` | Get notices for student's batch |
| `GET` | `/api/v1/notices/getNoticesById/:id` | Get specific notice |

### Fee Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/fees/assign` | Assign fee structure to student |
| `POST` | `/api/v1/fees/collect` | Collect payment (sends PDF receipt) |
| `GET` | `/api/v1/fees/defaulters` | Get students with pending fees |
| `GET` | `/api/v1/fees/ledger/:studentId` | Get student fee ledger |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/attendence/mark` | Mark daily attendance & email parents |

### Results & Timetable

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/results/save-result` | Upload result PDF |
| `POST` | `/api/v1/results/save-timetable` | Upload timetable |
| `GET` | `/api/v1/results/timetable/:batchId` | Get batch timetable |
| `GET` | `/api/v1/results/results/:batchId` | Get batch results |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/dashboard/stats` | Aggregated institute analytics |

---

## Data Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| **User** | fullName, email, EnrollmentNumber, batch, role, fcmToken, isVerified | Student/Teacher accounts |
| **Admin** | email, password, Name, isVerified | Admin accounts with 2FA |
| **Batch** | Name, batchcode, subjects, year, time, isActive | Coaching batches |
| **Attendance** | date, batch, absentStudents, totalStudents, markedBy | Daily attendance tracking |
| **Fee** | student, batch, totalFees, paidAmount, pendingAmount, status, transactions[] | Payment tracking with ledger |
| **Notice** | title, content, type (URGENT/INFO/RESULT/HOLIDAY), targetBatches | Broadcast notices |
| **Result** | student, batch, testName, marksObtained, totalMarks | Test/exam results |
| **StudyMaterial** | title, subject, batch, fileUrl, fileType, cloudinaryId | Uploaded resources |
| **TimeTable** | title, batch, fileUrl, cloudinaryId | Schedule files |
| **OTP** | email, otp, expiresAt (TTL index) | Email verification |
| **PendingAuth** | email, adminData, otp, expiresAt (TTL index) | Admin 2FA flow |

---

## Security

- **JWT Authentication** — Separate token secrets for users and admins with configurable expiry
- **Password Hashing** — bcrypt with 10 salt rounds
- **Rate Limiting** — `express-rate-limit` to prevent brute-force attacks
- **HTTP Security Headers** — `helmet` middleware
- **NoSQL Injection Prevention** — `express-mongo-sanitize`
- **HTTP Parameter Pollution** — `hpp` middleware
- **XSS Prevention** — `sanitize-html` for input sanitization
- **CORS** — Configurable cross-origin resource sharing
- **OTP Expiry** — MongoDB TTL index for automatic OTP cleanup
- **Input Validation** — Zod schemas on all mutating endpoints
- **Role-Based Access** — `protect` (user) and `protectAdmin` (admin) middleware

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- MongoDB instance (local or Atlas)
- Cloudinary account (for file uploads)
- Firebase project (for push notifications)
- Brevo/Sendinblue account (for email service)

### Installation

```bash
git clone https://github.com/your-username/CoachFlow-server.git
cd CoachFlow-server
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/coachflow

ACCESS_TOKEN_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d

ADMIN_ACCESS_TOKEN_SECRET=your_admin_jwt_secret
ADMIN_ACCESS_TOKEN_EXPIRY=1d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FIREBASE_PROJECT_ID=your_project_id

BREVO_API_KEY=your_brevo_key
SENDER_EMAIL=your_email
SENDER_NAME=your_name

ADMIN_SECRET_KEY=your_admin_registration_key
```

### Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Seed database
npm run seed
```

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Tests are written with **Jest** and **Supertest**, covering:
- User registration & authentication flows
- Admin 2FA authentication
- Batch CRUD operations
- Attendance marking & retrieval
- Notice creation & fetching
- Result management

---

## Project Highlights for Resume

> **CoachFlow** — Full-stack REST API for coaching institute management
>
> - Designed and built a scalable Node.js/Express backend serving 30+ REST endpoints with role-based JWT authentication
> - Implemented a fee management engine with automated payment tracking, PDF receipt generation (PDFKit), and defaulter detection
> - Built a batch-wise attendance system with MongoDB compound indexes ensuring data integrity and parent email notifications
> - Integrated Firebase Cloud Messaging for real-time push notifications and Cloudinary for cloud-based file storage
> - Secured the API with 7+ layers of protection: JWT, bcrypt, Helmet, rate-limiting, NoSQL injection prevention, XSS sanitization, and input validation (Zod)
> - Automated email workflows using Brevo API for OTP verification, fee receipts, and attendance reports
> - Achieved comprehensive test coverage with Jest + Supertest across all major modules

---

## Author

**Syed Aasim**

---

## License

ISC
