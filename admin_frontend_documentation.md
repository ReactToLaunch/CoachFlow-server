# CoachFlow Admin Website - Frontend Development Guide

> **Complete Backend API Documentation & Integration Guide**  
> This document provides every detail needed to build the Admin Website frontend for CoachFlow.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Backend Architecture](#backend-architecture)
3. [Environment Configuration](#environment-configuration)
4. [Authentication System](#authentication-system)
5. [Database Models](#database-models)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Frontend Tech Stack](#frontend-tech-stack)
8. [Page-by-Page Requirements](#page-by-page-requirements)
9. [State Management](#state-management)
10. [Error Handling](#error-handling)
11. [File Upload Integration](#file-upload-integration)

---

## 🎯 Project Overview

**CoachFlow** is an educational management system with three components:
- **Backend API** (Node.js + Express + MongoDB) - ✅ Complete
- **Admin Website** (Next.js) - 🔨 To Build
- **Mobile App** (React Native) - Future

### Admin Website Purpose
The admin panel is the control center for coaching institute management, handling:
- Student enrollment and batch management
- Fee collection and defaulter tracking
- Attendance marking with email notifications
- Notice broadcasting with push notifications
- Study material uploads
- Result/timetable management

---

## 🏗️ Backend Architecture

### Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (Separate tokens for Admin & Students)
- **File Storage**: Cloudinary
- **Email**: Nodemailer + Resend/Brevo
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Security**: Helmet, Rate Limiting, Mongo Sanitization, HPP

### Security Middleware
```javascript
// Applied globally
- helmet() - Security headers
- cors() - Cross-origin requests
- mongoSanitize() - NoSQL injection prevention
- hpp() - Parameter pollution prevention
- rateLimit() - 50 requests/15min (general), 5 requests/15min (auth)
```

---

## ⚙️ Environment Configuration

### Backend Server Details
```env
BASE_URL=http://localhost:8000
API_VERSION=/api/v1

# Available Routes
/api/v1/admin      # Admin auth
/api/v1/users      # Student auth
/api/v1/batches    # Batch CRUD
/api/v1/fees       # Fee management
/api/v1/attendence # Attendance
/api/v1/notices    # Notices
/api/v1/results    # Results & Timetables
```

### CORS Configuration
```javascript
CORS_ORIGIN=http://localhost:3000  // Your Next.js frontend
credentials: true  // Cookies allowed
```

---

## 🔐 Authentication System

### Admin Authentication Flow

#### 1. Admin Registration
**Endpoint**: `POST /api/v1/admin/registerAdmin`

**Request Body**:
```json
{
  "Name": "Super Admin",
  "email": "admin@coachflow.com",
  "password": "securepass123",
  "secretKey": "ADMIN_SECRET_FROM_ENV"
}
```

**Response** (200):
```json
{
  "statusCode": 200,
  "data": {
    "admin": {
      "_id": "65f...",
      "email": "admin@coachflow.com",
      "Name": "Super Admin",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Admin registered successfully",
  "success": true
}
```

**Validation Rules** (Zod Schema):
- Email: Valid email format, lowercase, trimmed
- Password: Required, min 8 characters
- Secret Key: Must match `process.env.ADMIN_SECRET`

---

#### 2. Admin Login
**Endpoint**: `POST /api/v1/admin/loginAdmin`

**Request Body**:
```json
{
  "email": "admin@coachflow.com",
  "password": "securepass123"
}
```

**Response** (200):
```json
{
  "statusCode": 200,
  "data": {
    "admin": {
      "_id": "65f...",
      "email": "admin@coachflow.com",
      "Name": "Super Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Admin logged in successfully",
  "success": true
}
```

**JWT Token Details**:
```javascript
// Token Payload
{
  "_id": "admin_id",
  "role": "superadmin"
}

// Secret: process.env.ADMIN_ACCESS_TOKEN_SECRET
// Expiry: 1 day
```

**Frontend Storage**:
```javascript
// Store token in localStorage/cookies
localStorage.setItem('adminToken', response.data.token);

// Attach to all subsequent requests
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

### Protected Routes Middleware

#### `protectAdmin` Middleware
All admin endpoints require this middleware.

**How it works**:
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies using `ADMIN_ACCESS_TOKEN_SECRET`
3. Fetches admin from database
4. Attaches `req.admin` to request object

**Usage in Routes**:
```javascript
router.post("/createBatch", protectAdmin, CreateBatch);
```

**Frontend Implementation**:
```javascript
// Axios instance with auto-token attachment
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📊 Database Models

### 1. Admin Model
```javascript
{
  email: String (unique, required, lowercase),
  password: String (required, bcrypt hashed),
  Name: String (default: "Super Admin"),
  createdAt: Date,
  updatedAt: Date
}

// Methods
admin.validatePassword(password) // Returns boolean
admin.generateAccessToken() // Returns JWT
```

---

### 2. User (Student) Model
```javascript
{
  fullName: String (required),
  EnrollmentNumber: String (required, unique, indexed),
  email: String (required, unique, lowercase),
  batch: ObjectId (ref: "Batch"),
  isVerified: Boolean (default: false),
  password: String (required, bcrypt hashed),
  phone: String (unique, sparse),
  avatar: String (default: ""),
  selectedRole: String (enum: ['student', 'admin', 'teacher'], default: 'student'),
  fcmToken: String (for push notifications),
  createdAt: Date,
  updatedAt: Date
}

// Methods
user.validatePassword(password)
user.generateAccessToken()
user.generateRefreshToken()
```

**Important Notes**:
- Students self-register with batch code
- `selectedRole` cannot be 'admin' during registration
- FCM token saved for push notifications

---

### 3. Batch Model
```javascript
{
  Name: String (required, trimmed),
  batchcode: String (required, unique, uppercase),
  subjects: [String] (required),
  year: Number (required),
  time: String (required),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Example**:
```json
{
  "Name": "JEE Advanced 2025",
  "batchcode": "JEE25A",
  "subjects": ["Physics", "Chemistry", "Mathematics"],
  "year": 2025,
  "time": "6:00 AM - 9:00 AM",
  "isActive": true
}
```

---

### 4. Fee Model (Complex)
```javascript
{
  student: ObjectId (ref: "User", required),
  batch: ObjectId (ref: "Batch", required),
  
  // Fee Structure
  totalFees: Number (required, min: 0),
  discount: Number (default: 0, min: 0),
  finalAmount: Number (auto-calculated: totalFees - discount),
  
  // Payment Tracking
  paidAmount: Number (default: 0, min: 0),
  pendingAmount: Number (auto-calculated: finalAmount - paidAmount),
  nextDueDate: Date (required),
  status: String (enum: ["PAID", "PARTIAL", "PENDING", "OVERDUE"]),
  
  // Transaction History
  transactions: [
    {
      amount: Number (required, min: 1),
      paymentMode: String (enum: ["CASH", "ONLINE", "UPI", "CHEQUE"]),
      transactionId: String (default: ""),
      date: Date (default: now),
      collectedBy: ObjectId (ref: "Admin")
    }
  ],
  
  createdAt: Date,
  updatedAt: Date
}
```

**Auto-Calculations** (Pre-save hook):
```javascript
// Status Logic
if (pendingAmount <= 0) → "PAID"
else if (paidAmount > 0) → "PARTIAL"
else → "PENDING"

// Overdue Check
if (pendingAmount > 0 && Date.now() > nextDueDate) → "OVERDUE"
```

---

### 5. Attendance Model
```javascript
{
  date: Date (required, indexed),
  batch: ObjectId (ref: "Batch", required, indexed),
  absentStudents: [ObjectId] (ref: "User"),
  totalStudents: Number (required),
  markedBy: ObjectId (ref: "Admin"),
  createdAt: Date,
  updatedAt: Date
}

// Unique Index: { batch: 1, date: 1 }
// Prevents duplicate attendance for same batch on same day
```

**Logic**:
- Only absent students are stored
- Present students = All batch students - absentStudents
- Email sent to parents for both present/absent

---

### 6. Notice Model
```javascript
{
  title: String (required, trimmed),
  content: String (required),
  type: String (enum: ["URGENT", "INFO", "RESULT", "HOLIDAY"], default: "INFO"),
  targetBatches: [ObjectId] (ref: "Batch"),
  postedBy: ObjectId (ref: "Admin"),
  createdAt: Date,
  updatedAt: Date
}
```

**Special Cases**:
- Empty `targetBatches` array = All batches
- FCM push notification sent on creation

---

### 7. StudyMaterial Model
```javascript
{
  title: String (required, trimmed),
  description: String (trimmed),
  subject: String (required, uppercase),
  batch: ObjectId (ref: "Batch", required),
  fileUrl: String (required, Cloudinary URL),
  fileType: String (enum: ["PDF", "IMAGE", "LINK"], default: "PDF"),
  cloudinaryId: String (required),
  uploadedBy: ObjectId (ref: "User"),
  createdAt: Date,
  updatedAt: Date
}

// Index: { batch: 1, subject: 1 } for fast queries
```

---

### 8. Result Model
```javascript
{
  student: ObjectId (ref: "User", required),
  batch: ObjectId (ref: "Batch", required),
  testName: String (required),
  testDate: Date (default: now),
  marksObtained: Number (required),
  totalMarks: Number (required),
  createdAt: Date,
  updatedAt: Date
}

// Index: { student: 1, testDate: -1 }
```

---

### 9. TimeTable Model
```javascript
{
  title: String (required, trimmed),
  batch: ObjectId (ref: "Batch", required),
  fileUrl: String (required, Cloudinary URL),
  cloudinaryId: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

---

### 10. StudentProfile Model
```javascript
{
  user: ObjectId (ref: "User", required, unique),
  batch: ObjectId (ref: "Batch", required),
  admissionNumber: String (required, unique, uppercase),
  rollNumber: String,
  parentsName: String (required),
  parentsPhone: String (required),
  address: String,
  dob: Date,
  gender: String (enum: ["Male", "Female", "Other"]),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints Reference

### Admin Authentication

#### Register Admin
```http
POST /api/v1/admin/registerAdmin
Content-Type: application/json

{
  "Name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123",
  "secretKey": "SECRET_KEY"
}
```

#### Login Admin
```http
POST /api/v1/admin/loginAdmin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

---

### Batch Management

#### Create Batch
```http
POST /api/v1/batches/createBatch
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "Name": "JEE 2025 Batch A",
  "batchcode": "JEE25A",
  "subjects": ["Physics", "Chemistry", "Maths"],
  "year": 2025,
  "time": "6:00 AM - 9:00 AM"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "batch": {
      "_id": "65f...",
      "Name": "JEE 2025 Batch A",
      "batchcode": "JEE25A",
      "subjects": ["Physics", "Chemistry", "Maths"],
      "year": 2025,
      "time": "6:00 AM - 9:00 AM",
      "isActive": true
    }
  },
  "message": "Batch created successfully"
}
```

---

#### Get All Batches
```http
GET /api/v1/batches/getAllBatches
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "batches": [
      {
        "_id": "65f...",
        "Name": "JEE 2025 Batch A",
        "batchcode": "JEE25A",
        "subjects": ["Physics", "Chemistry", "Maths"],
        "year": 2025,
        "time": "6:00 AM - 9:00 AM",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  "message": "Batches fetched successfully"
}
```

---

#### Get Batch By ID
```http
GET /api/v1/batches/getBatchById/:id
Authorization: Bearer <admin_token>
```

---

#### Update Batch
```http
PUT /api/v1/batches/updateBatch/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "Name": "Updated Batch Name",
  "time": "7:00 AM - 10:00 AM"
}
```

---

### Fee Management

#### Assign Fees to Student
```http
POST /api/v1/fees/assign
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "studentId": "65f...",
  "batchId": "65f...",
  "totalFees": 50000,
  "discount": 5000,
  "nextDueDate": "2024-02-15"
}
```

**Response**:
```json
{
  "statusCode": 201,
  "data": {
    "_id": "65f...",
    "student": "65f...",
    "batch": "65f...",
    "totalFees": 50000,
    "discount": 5000,
    "finalAmount": 45000,
    "paidAmount": 0,
    "pendingAmount": 45000,
    "status": "PENDING",
    "nextDueDate": "2024-02-15T00:00:00.000Z",
    "transactions": []
  },
  "message": "Fees structure assigned successfully"
}
```

---

#### Collect Fee Payment
```http
POST /api/v1/fees/collect
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "studentId": "65f...",
  "amount": 10000,
  "paymentMode": "UPI",
  "transactionId": "UPI123456789",
  "nextDueDate": "2024-03-15"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "_id": "65f...",
    "student": {
      "_id": "65f...",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "paidAmount": 10000,
    "pendingAmount": 35000,
    "status": "PARTIAL",
    "transactions": [
      {
        "amount": 10000,
        "paymentMode": "UPI",
        "transactionId": "UPI123456789",
        "date": "2024-01-20T10:30:00.000Z",
        "collectedBy": "65f..."
      }
    ]
  },
  "message": "Payment collected successfully"
}
```

**Side Effects**:
- Email sent to student with PDF receipt
- Receipt generated using PDFKit
- WhatsApp link can be generated (frontend logic)

---

#### Get Defaulters
```http
GET /api/v1/fees/defaulters?batchId=65f...
Authorization: Bearer <admin_token>
```

**Query Params**:
- `batchId` (optional): Filter by specific batch

**Response**:
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "65f...",
      "student": {
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "phone": "9876543210"
      },
      "batch": {
        "name": "JEE 2025 Batch A"
      },
      "pendingAmount": 35000,
      "status": "OVERDUE",
      "nextDueDate": "2024-01-10T00:00:00.000Z"
    }
  ],
  "message": "Defaulters list fetched successfully"
}
```

---

#### Get Student Fee Ledger
```http
GET /api/v1/fees/ledger/:studentId
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "student": {
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "totalFees": 50000,
    "discount": 5000,
    "finalAmount": 45000,
    "paidAmount": 10000,
    "pendingAmount": 35000,
    "status": "PARTIAL",
    "transactions": [
      {
        "amount": 10000,
        "paymentMode": "UPI",
        "transactionId": "UPI123456789",
        "date": "2024-01-20T10:30:00.000Z",
        "collectedBy": {
          "name": "Super Admin",
          "email": "admin@coachflow.com"
        }
      }
    ]
  },
  "message": "Student ledger fetched successfully"
}
```

---

### Attendance Management

#### Mark Attendance
```http
POST /api/v1/attendence/mark
Content-Type: application/json

{
  "date": "2024-01-20",
  "courseId": "Physics",
  "records": [
    {
      "studentId": "65f...",
      "status": "PRESENT"
    },
    {
      "studentId": "65f...",
      "status": "ABSENT"
    }
  ]
}
```

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "_id": "65f...",
    "date": "2024-01-20T00:00:00.000Z",
    "courseId": "Physics",
    "records": [...]
  },
  "message": "Attendance marked and emails sent successfully"
}
```

**Side Effects**:
- Email sent to parents for each student
- Present: "Safe Arrival" email
- Absent: "Absent Alert" email
- 1-second delay between emails to avoid rate limiting

---

### Notice Management

#### Create Notice
```http
POST /api/v1/notices/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Holiday Notice",
  "content": "Classes will remain closed on 26th January",
  "type": "HOLIDAY",
  "targetBatches": ["65f...", "65f..."]
}
```

**Response**:
```json
{
  "statusCode": 201,
  "data": {
    "_id": "65f...",
    "title": "Holiday Notice",
    "content": "Classes will remain closed on 26th January",
    "type": "HOLIDAY",
    "targetBatches": ["65f...", "65f..."],
    "postedBy": "65f...",
    "createdAt": "2024-01-20T10:30:00.000Z"
  },
  "message": "Notice created successfully"
}
```

**Notes**:
- `targetBatches: []` or `["All"]` → Sent to all batches
- FCM push notification sent to students (backend handles this)

---

#### Get All Notices (Student View)
```http
GET /api/v1/notices/getNotices
Authorization: Bearer <student_token>
```

---

#### Get Notice By ID
```http
GET /api/v1/notices/getNoticesById/:id
Authorization: Bearer <student_token>
```

---

### Study Material Management

#### Upload Study Material
```http
POST /api/v1/studyMaterial/sendStudyMaterial
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "title": "Chapter 1 - Mechanics",
  "description": "Introduction to Mechanics",
  "subject": "Physics",
  "batchId": "65f...",
  "file": <PDF/Image File>
}
```

**Response**:
```json
{
  "statusCode": 201,
  "data": {
    "_id": "65f...",
    "title": "Chapter 1 - Mechanics",
    "description": "Introduction to Mechanics",
    "subject": "PHYSICS",
    "batch": "65f...",
    "fileUrl": "https://res.cloudinary.com/...",
    "cloudinaryId": "study_materials/abc123",
    "fileType": "PDF",
    "uploadedBy": "65f...",
    "createdAt": "2024-01-20T10:30:00.000Z"
  },
  "message": "Study Material Uploaded Successfully"
}
```

---

#### Get Batch Materials
```http
GET /api/v1/studyMaterial/getMaterial/:batchId?subject=Physics
Authorization: Bearer <token>
```

**Query Params**:
- `subject` (optional): Filter by subject

---

### Results & Timetable

#### Save Result (PDF Upload)
```http
POST /api/v1/results/save-result
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "title": "Mid-Term Results",
  "batchId": "65f...",
  "result": <PDF File>
}
```

---

#### Save Timetable
```http
POST /api/v1/results/save-timetable
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "title": "Weekly Timetable",
  "batchId": "65f...",
  "timetable": <Image/PDF File>
}
```

---

#### Get Timetable
```http
GET /api/v1/results/timetable/:batchId
Authorization: Bearer <admin_token>
```

---

#### Get Results
```http
GET /api/v1/results/results/:batchId
Authorization: Bearer <admin_token>
```

---

## 🎨 Frontend Tech Stack

### Recommended Stack (from Blueprint)

```javascript
{
  "framework": "Next.js 14+ (App Router)",
  "styling": "Tailwind CSS + Shadcn/UI",
  "stateManagement": "Zustand",
  "dataFetching": "TanStack Query (React Query)",
  "icons": "Lucide React",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts / Chart.js"
}
```

---

## 📄 Page-by-Page Requirements

### 1. Login Page (`/login`)

**Features**:
- Email + Password form
- Form validation (Zod)
- Error display
- "Remember Me" option
- Redirect to `/dashboard` on success

**API Integration**:
```javascript
const login = async (email, password) => {
  const response = await api.post('/admin/loginAdmin', {
    email,
    password
  });
  
  // Store token
  localStorage.setItem('adminToken', response.data.data.token);
  
  // Store admin info in Zustand
  useAuthStore.setState({ 
    admin: response.data.data.admin,
    isAuthenticated: true 
  });
  
  router.push('/dashboard');
};
```

---

### 2. Dashboard (`/dashboard`)

**Widgets**:

#### Revenue Cards
```javascript
// Data from /api/v1/fees/defaulters
const stats = {
  totalCollected: sum(allFees.paidAmount),
  totalPending: sum(allFees.pendingAmount),
  monthlyGrowth: calculateGrowth()
};
```

#### Defaulter Widget
```javascript
// Top 5 students with highest pending
const topDefaulters = defaulters
  .sort((a, b) => b.pendingAmount - a.pendingAmount)
  .slice(0, 5);
```

#### Quick Actions
- Floating button: "Mark Attendance"
- Floating button: "Collect Fee"

---

### 3. Batches Page (`/dashboard/batches`)

**Features**:
- Table with columns: Name, Code, Subjects, Year, Time, Actions
- "Create Batch" button → Modal
- Edit/Delete actions
- Search & filter

**API Calls**:
```javascript
// Fetch batches
const { data: batches } = useQuery({
  queryKey: ['batches'],
  queryFn: () => api.get('/batches/getAllBatches')
});

// Create batch
const createMutation = useMutation({
  mutationFn: (data) => api.post('/batches/createBatch', data),
  onSuccess: () => queryClient.invalidateQueries(['batches'])
});
```

---

### 4. Students Page (`/dashboard/students`)

**Features**:
- Student list with batch info
- Search by name/enrollment
- Filter by batch
- View student profile (shows fee ledger, attendance %)

**Note**: No direct student CRUD API. Students self-register via mobile app.

---

### 5. Fees Page (`/dashboard/fees`)

**Features**:

#### Fee Ledger Table
Columns: Student Name, Batch, Total, Paid, Pending, Status, Actions

```javascript
const { data: defaulters } = useQuery({
  queryKey: ['defaulters'],
  queryFn: () => api.get('/fees/defaulters')
});
```

#### Collect Fee Modal
```javascript
const collectFee = async (data) => {
  await api.post('/fees/collect', {
    studentId: data.studentId,
    amount: data.amount,
    paymentMode: data.mode,
    transactionId: data.txnId,
    nextDueDate: data.nextDue
  });
  
  // Generate WhatsApp link
  const message = `Payment of ₹${data.amount} received. Receipt sent to email.`;
  const whatsappUrl = `https://wa.me/${parentPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};
```

#### Defaulter Filter
Toggle to show only `status: "OVERDUE"` or `pendingAmount > 0`

---

### 6. Attendance Page (`/dashboard/attendance`)

**Features**:
- Select batch
- Select date
- Grid view of students with checkboxes
- "Select All" / "Invert Selection" buttons
- Submit → Calls `/api/v1/attendence/mark`

**Implementation**:
```javascript
const [selectedStudents, setSelectedStudents] = useState([]);

const markAttendance = async () => {
  const records = allStudents.map(student => ({
    studentId: student._id,
    status: selectedStudents.includes(student._id) ? 'PRESENT' : 'ABSENT'
  }));
  
  await api.post('/attendence/mark', {
    date: selectedDate,
    courseId: selectedSubject,
    records
  });
};
```

---

### 7. Notices Page (`/dashboard/notices`)

**Features**:
- Create notice form
- Select target batches (multi-select)
- Notice type dropdown (URGENT, INFO, RESULT, HOLIDAY)
- List of past notices

**API**:
```javascript
const createNotice = async (data) => {
  await api.post('/notices/create', {
    title: data.title,
    content: data.content,
    type: data.type,
    targetBatches: data.batches // Array of batch IDs or ["All"]
  });
};
```

---

### 8. Study Materials Page (`/dashboard/materials`)

**Features**:
- Upload form (Title, Description, Subject, Batch, File)
- File upload to Cloudinary (handled by backend)
- List materials by batch/subject

**API**:
```javascript
const uploadMaterial = async (formData) => {
  // formData includes file
  await api.post('/studyMaterial/sendStudyMaterial', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

---

### 9. Results Page (`/dashboard/results`)

**Features**:
- Upload result PDF
- Upload timetable image/PDF
- View uploaded files by batch

---

## 🗂️ State Management (Zustand)

### Auth Store (`useAuthStore.ts`)
```typescript
interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  token: localStorage.getItem('adminToken'),
  isAuthenticated: !!localStorage.getItem('adminToken'),
  
  login: async (email, password) => {
    const response = await api.post('/admin/loginAdmin', { email, password });
    const { admin, token } = response.data.data;
    
    localStorage.setItem('adminToken', token);
    set({ admin, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
    set({ admin: null, token: null, isAuthenticated: false });
  }
}));
```

---

## ⚠️ Error Handling

### API Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation Error",
  "errors": {...},
  "success": false
}
```

### Frontend Error Handling
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      useAuthStore.getState().logout();
      router.push('/login');
    }
    
    // Show toast notification
    toast.error(error.response?.data?.message || 'Something went wrong');
    
    return Promise.reject(error);
  }
);
```

---

## 📤 File Upload Integration

### Multer Configuration (Backend)
```javascript
// Accepts: PDF, Images (JPEG, PNG)
// Max size: 10MB (configured in backend)
// Storage: Cloudinary
```

### Frontend Implementation
```javascript
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('title', 'Chapter 1');
  formData.append('subject', 'Physics');
  formData.append('batchId', '65f...');
  formData.append('file', file);
  
  await api.post('/studyMaterial/sendStudyMaterial', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

---

## 🔒 Security Best Practices

1. **Token Storage**: Use `httpOnly` cookies (more secure than localStorage)
2. **CSRF Protection**: Implement CSRF tokens for state-changing operations
3. **Input Validation**: Use Zod schemas on frontend matching backend
4. **XSS Prevention**: Sanitize user inputs before rendering
5. **Rate Limiting**: Show user-friendly messages when rate limited

---

## 📝 Additional Notes

### Email Notifications
Backend automatically sends emails for:
- Fee payment receipts (with PDF)
- Attendance alerts (present/absent)

### Push Notifications
Backend sends FCM notifications when:
- Notice is created
- (Future: Fee due reminders)

### WhatsApp Integration
Frontend generates WhatsApp links:
```javascript
const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
```

---

## 🚀 Getting Started Checklist

- [ ] Set up Next.js 14 project with App Router
- [ ] Install dependencies (Tailwind, Shadcn/UI, Zustand, React Query)
- [ ] Create Axios instance with interceptors
- [ ] Implement auth store (Zustand)
- [ ] Create login page
- [ ] Implement protected route middleware (Next.js)
- [ ] Build dashboard layout (Sidebar + Header)
- [ ] Create batch management pages
- [ ] Implement fee collection flow
- [ ] Build attendance marking interface
- [ ] Create notice broadcasting system
- [ ] Implement file upload for study materials
- [ ] Add results/timetable upload

---

## 📞 Support

For backend issues or API clarifications, refer to:
- Source code: `e:\server\CoachFlow-server`
- Models: `src/models/`
- Controllers: `src/controllers/`
- Routes: `src/routes/`

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-20  
**Backend API Version**: v1
