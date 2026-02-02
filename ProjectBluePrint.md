# CoachFlow Development Blueprint & Roadmap

## Phase 1: Backend (Node.js + Express)
*The core infrastructure and logic.*

### 1. Authentication & Security
- [x] **Admin Registration:** (Sign up with Secret Key)
- [x] **Admin Login:** (JWT Token Generation)
- [x] **Student Signup:** (Self-signup via Batch Code & Auto-linking)
- [x] **Student Login:** (JWT Token Generation)
- [x] **Middleware Protection:** (`protect` and `protectAdmin` middleware)
- [x] **Firebase Setup:** (Server configuration for FCM Push Notifications)

### 2. Batch Management
- [x] **Create Batch:** (Validation for Name, Code, Subjects, etc.)
- [x] **Get All Batches:** (API for Admin Dashboard list)
- [x] **Get Single Batch:** (API for detailed view/editing)
- [x] **Update Batch:** (Edit schedule, subjects, etc.)
- [x] **Delete Batch:** (Logic to remove batch and handle linked students)

### 3. Notices & Communication
- [x] **Create Notice:** (Save Title/Body to Database)
- [x] **Push Notification:** (Integration with Firebase to ping devices)
- [x] **Get Notices (Student Side):** (API for App to fetch student-specific notices)
- [x] **Weekly Timetable:** (Upload Image/PDF of schedule for batch) 🆕

### 4. Attendance System (Critical)
- [x] **Mark Attendance:** (Controller to mark Present/Absent for an entire batch)
- [x] **Get Attendance (Student):** (Controller to calculate % for a specific student)
- [x] **Get Attendance Report (Admin):** (Controller for monthly reports)

### 5. Performance Module(Test Results) 🆕 This will be built on Demand
- [ ] **Create Test:** (Admin inputs Test Name, Total Marks, Date)
- [ ] **Upload Marks:** (Admin inputs marks for student list)
- [x] **Get Result (Student):** (View Marks, Rank, and Graph)

### 6. Fee Management 🆕
- [x] **Set Fee Status:** (Admin marks "Paid", "Pending", "Overdue")
- [x] **Fee Reminder:** (Auto-notification if status is "Overdue")
- [x] **Get Fee Status (Student):** (Show Red/Green banner on Home Screen)

### 7. Study Material (Notes)
- [x] **Upload PDF/Image:** (Multer + Cloudinary/S3 setup)
- [x] **Get Notes:** (API to fetch materials filtered by Subject)

---

## Phase 2: Admin Website (React / Next.js)
*The Control Center for Teachers/Admins.*

### 1. Core UI
- [ ] **Login Screen:** (Email/Password)
- [ ] **Dashboard Home:** (Stats: Total Students, Batches, Fees Pending)

### 2. Management Modules
- [ ] **Batch Manager:** (Create/Edit Batches)
- [ ] **Student List:** (View students, Verify users, Check Fee Status)
- [ ] **Attendance Interface:** (Date picker + Student list with checkboxes)
- [ ] **Result Portal:** (Form to enter marks for tests) 🆕

---

## Phase 3: Mobile App (React Native + Expo)
*The Student Interface.*

### 1. Onboarding
- [ ] **Splash Screen:** (Branding)
- [ ] **Signup Flow:** (Name, Email, Pass, Parents Phone, **Batch Code**)
- [ ] **Login Flow:** (JWT storage in SecureStore)

### 2. Core Features
- [ ] **Home Tab:** (Notices, Fee Status Banner, Timetable)
- [ ] **Attendance Tab:** (Calendar view & Percentage stats)
- [ ] **Results Tab:** (Test Scores, Ranks) 🆕
- [ ] **Profile Tab:** (User details, Logout)