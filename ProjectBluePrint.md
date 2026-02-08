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

### 5. Fee Management (The "Asset" Feature) 🆕
- [x] **Assign Fees:** (Associate fee structure with students)
- [x] **Collect Fee:** (Logic to accept payment and update ledger)
- [x] **Get Defaulters:** (Filter students by "Overdue" status)
- [x] **Get Fee History:** (Student-specific view of transactions)

### 6. Study Material (Notes)
- [x] **Upload PDF/Image:** (Multer + Cloudinary/S3 setup)
- [x] **Get Notes:** (API to fetch materials filtered by Subject)

---

## Phase 2: Admin Website (Next.js + Tailwind)
*The Control Center. Built for Speed, Finance Tracking, and Security.*

### 1. Architecture & Tech Stack
- [ ] **Framework:** Next.js 14+ (App Router)
- [ ] **Styling:** Tailwind CSS + Shadcn/UI (Components)
- [ ] **State Management:** Zustand (User Session & Sidebar State)
- [ ] **Data Fetching:** TanStack Query (React Query) - *Best for client-side dashboards*
- [ ] **Icons:** Lucide React

### 2. Core UI & Security
- [ ] **Middleware Protection:** (Next.js Middleware to check JWT cookies and redirect unauthenticated users)
- [ ] **Axios Instance:** (Centralized API client with interceptors for auto-attaching tokens)
- [ ] **Auth Context:** (Global provider to handle Login/Logout state)
- [ ] **Layout Architecture:** (`layout.tsx` for the persistent Sidebar and Header)

### 3. Dashboard (The "Command Center") - `/dashboard`
- [ ] **Revenue Cards:** (Total Collected, Total Pending, Monthly Growth)
- [ ] **Live Feed:** (Real-time log of "Fee Collected" or "Notice Sent")
- [ ] **Quick Actions:** (Floating buttons for "Take Attendance" and "Collect Fee")
- [ ] **Defaulter Widget:** (Top 5 students with overdue fees)

### 4. Fee Management Module - `/dashboard/fees`
- [ ] **Fee Ledger Table:** (Columns: Name, Batch, Total, Paid, Pending, Status)
- [ ] **Collect Fee Modal:** (Input Amount -> Select Mode -> **Generate WhatsApp Link**)
- [ ] **Transaction History:** (View all past payments with Dates)
- [ ] **Defaulter Filter:** (One-click view of all "Overdue" students)

### 5. Attendance & Batches - `/dashboard/attendance` & `/dashboard/batches`
- [ ] **Attendance Interface:** (Grid view with "Select All" / "Invert Selection" for speed)
- [ ] **Batch Scheduler:** (Visual tool to upload Timetable images)
- [ ] **Student Directory:** (Searchable list with Edit/Delete options)
---

## Phase 3: Mobile App (React Native + Expo)
*The Student Interface.*

### 1. Onboarding
- [ ] **Splash Screen:** (Branding: "CoachFlow by ReactToLaunch")
- [ ] **Signup Flow:** (Name, Email, Pass, Parents Phone, **Batch Code**)
- [ ] **Login Flow:** (JWT storage in SecureStore)

### 2. Core Features
- [ ] **Home Tab:** (Notices, Fee Status Banner (Red/Green), Timetable)
- [ ] **Attendance Tab:** (Calendar view & Percentage stats)
- [ ] **Profile Tab:** (User details, Logout)

### 3. Future Updates (Post-MVP)
- [ ] **Results Tab:** (Test Scores, Ranks - *Deferred as per strategy*)


admin-panel/
├── public/                 # Static images (Logo, favicon)
├── src/
│   ├── app/                # 🚀 The Pages (Routes)
│   │   ├── (auth)/         # Route Group (No Sidebar here)
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/    # Route Group (Has Sidebar & Navbar)
│   │   │   ├── layout.tsx  # 🛡️ THE SHELL (Sidebar + Header live here)
│   │   │   ├── page.tsx    # (Home) - The Stats Dashboard
│   │   │   ├── fees/
│   │   │   │   └── page.tsx
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx
│   │   │   ├── batches/
│   │   │   │   └── page.tsx
│   │   │   └── students/
│   │   │       └── page.tsx
│   │   │
│   │   ├── layout.tsx      # Root Layout (Providers wrapper)
│   │   └── globals.css     # Tailwind imports
│   │
│   ├── components/         # 🧩 The Building Blocks
│   │   ├── ui/             # Shadcn UI (Button, Input, Card, Table...)
│   │   │
│   │   ├── layout/         # App Shell Components
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   │
│   │   ├── fees/           # 💰 Fee Specific Components
│   │   │   ├── FeeTable.tsx
│   │   │   ├── CollectFeeModal.tsx  # 👈 WhatsApp Logic goes here
│   │   │   └── DefaulterWidget.tsx
│   │   │
│   │   ├── attendance/     # 📅 Attendance Components
│   │   │   └── AttendanceGrid.tsx
│   │   │
│   │   └── shared/         # Reusable across pages
│   │       ├── PageHeader.tsx
│   │       └── StatusBadge.tsx
│   │
│   ├── lib/                # ⚙️ Configuration
│   │   ├── axios.ts        # The Axios Instance (Auto-attaches Token)
│   │   └── utils.ts        # Tailwind helper (cn)
│   │
│   ├── services/           # 📡 API Calls (Separation of Concerns)
│   │   ├── auth.service.ts
│   │   ├── fee.service.ts
│   │   └── batch.service.ts
│   │
│   ├── store/              # 🏪 State Management (Zustand)
│   │   └── useAuthStore.ts # Stores user, token, isAuthenticated
│   │
│   ├── hooks/              # 🪝 Custom Hooks (React Query)
│   │   ├── useFees.ts      # useQuery logic for fetching fees
│   │   └── useBatches.ts
│   │
│   └── middleware.ts       # 🔒 Security Guard (Protects routes)
│
├── .env.local              # Environment variables (API URL)
└── next.config.js