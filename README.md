# DG Interns Hub — Advanced Job & Internship Portal (Week 10 Upgrade)

An enterprise-ready, full-stack recruitment platform connecting candidates, recruiters, and administrators. Built with React 19, Vite, React Router 7, Axios, Node.js, Express.js 5, and MongoDB Atlas.

---

## 🌟 Week 10 Objectives Achieved

- **Modular Architecture**: Restructured cleanly into `components/`, `pages/`, `context/`, `hooks/`, `services/`, and `utils/`.
- **Role-Based Access Control (RBAC)**: Secure multi-tier authentication for **Candidate**, **Recruiter**, and **Admin** with client route protection and backend authorization.
- **Dedicated Dashboards**:
  - **Candidate Dashboard**: Real application progression tracker (Applied → Under Review → Shortlisted → Interview → Selected/Rejected), statistics, recommended matching jobs, application modal.
  - **Recruiter Dashboard**: Manage job postings (Create/Edit/Delete), review applicant profiles, filter applicants by stage, and update application progression.
  - **Admin Dashboard**: System metrics (users, recruiters, jobs, applications breakdown), user enable/disable management, job moderation.
- **Centralized API Integration**: Robust `services/api.js` client with bearer token interception, 401 handling, timeout management, and unified error parsing.
- **Advanced Filtering, Sorting & Search**: Real-time debounced search (`useDebounce`), multi-attribute filtering (Type, Location, Skill, Company, Min Salary), and server-side sorting.
- **Transparent Skill Match UI (Task 14)**: Algorithm computing transparent skill compatibility percentages between candidate profile skills and job requirements with detailed rationale.
- **Modern Notification & Toast System**: Global toast notifications for CRUD feedback, unread badge counter, and dismissible notification drawer.
- **Light / Dark Theme Toggle**: CSS variable-driven theme switcher persisted across browser sessions in `localStorage`.
- **Performance Optimizations (Task 13)**: Code-splitting and lazy loading with React `Suspense`, debounced inputs to eliminate redundant API calls, and memoized skill match calculations.

---

## 🏗️ Project Architecture

```text
├── week7-job-landing/ (Frontend)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Navbar.jsx            # Responsive header with theme & notification triggers
│   │   │   ├── Sidebar.jsx           # Role-aware dashboard sidebar
│   │   │   ├── JobCard.jsx           # Job listing card with skill match badge
│   │   │   ├── JobFilter.jsx         # Debounced multi-filter panel
│   │   │   ├── ProtectedRoute.jsx    # Role-based route guard
│   │   │   ├── Pagination.jsx        # Server/client pagination controls
│   │   │   ├── NotificationPanel.jsx # Notification drawer
│   │   │   ├── ToastContainer.jsx    # Animated toast system
│   │   │   ├── Modal.jsx             # Accessible modal dialog
│   │   │   ├── ApplicationModal.jsx  # Detailed candidate application viewer
│   │   │   ├── SkeletonLoader.jsx    # Skeleton layout for loading states
│   │   │   ├── ErrorMessage.jsx      # Error banner with retry trigger
│   │   │   └── EmptyState.jsx        # Empty state prompt
│   │   ├── context/          # Global application state
│   │   │   ├── AuthContext.jsx       # Auth state, user profile, login/logout, tokens
│   │   │   └── AppContext.jsx        # Dark/light theme, toast alerts, notifications
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuth.js            # Authentication hook
│   │   │   └── useDebounce.js        # Debounce hook for input throttling
│   │   ├── pages/            # View components & dashboards
│   │   │   ├── Jobs.jsx              # Search, filter, sort & pagination
│   │   │   ├── JobDetails.jsx        # Job description & AI match breakdown
│   │   │   ├── CandidateDashboard.jsx# Candidate application tracker
│   │   │   ├── RecruiterDashboard.jsx# Recruiter job and applicant management
│   │   │   ├── AdminDashboard.jsx    # Admin system overview and user toggle
│   │   │   ├── ApplicationForm.jsx   # File-validated job application form
│   │   │   ├── Profile.jsx           # Candidate/User profile editor
│   │   │   ├── Login.jsx             # Dedicated login route
│   │   │   ├── Register.jsx          # Dedicated registration route
│   │   │   └── Auth.jsx              # Combined auth tab switcher
│   │   ├── services/         # Centralized HTTP services
│   │   │   └── api.js                # Axios client with bearer tokens & interceptors
│   │   ├── utils/            # Helper utilities
│   │   │   ├── matching.js           # Transparent skill-matching algorithm
│   │   │   └── validation.js         # Input validation rules
│   │   ├── App.jsx           # Main routing & provider composition
│   │   └── main.jsx          # Root DOM mounting
│
└── week8-backend/ (Backend)
    ├── server/
    │   ├── controllers/      # Route controllers (Auth, Jobs, Applications, Users)
    │   ├── models/           # Mongoose schemas (User, Job, Application)
    │   ├── routes/           # RESTful API route definitions
    │   ├── middleware/       # Auth guards, role verification, rate limiting, multer
    │   ├── validators/       # Request input validation schemas
    │   └── server.js         # Express app initialization & MongoDB Atlas connection
```

---

## ⚡ Performance Optimizations Implemented

1. **Route-Level Code Splitting & Lazy Loading (`React.lazy` + `Suspense`)**:
   - Heavy dashboard bundles (`CandidateDashboard`, `RecruiterDashboard`, `AdminDashboard`, `Login`, `Register`) are loaded on-demand, reducing initial bundle weight.
2. **Debounced Search & Filtering (`useDebounce`)**:
   - User inputs on search, location, skills, company, and salary are throttled by 400ms, preventing wasteful API requests on every keystroke.
3. **Memoized Skill Match Calculations (`useMemo`)**:
   - The skill matching score and reason breakdown on `JobDetails.jsx` and `CandidateDashboard.jsx` are cached, recalculating only when the user profile or target job changes.

---

## 🧪 Comprehensive Verification & Testing Table

| Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|
| **1. Registration with Valid Details** | Account created, JWT returned, redirects to role dashboard | User created in MongoDB, token stored, redirected | **Passed** |
| **2. Registration with Invalid Details** | Inline error highlights (email format, password < 8 chars) | Proper validation errors rendered without page reload | **Passed** |
| **3. Successful Login** | Token saved, session initialized, role-based redirect | Auth context updated, redirected to respective dashboard | **Passed** |
| **4. Invalid Login** | Display user-friendly error message, prevent access | "Invalid credentials" error shown clearly | **Passed** |
| **5. User Logout** | Token cleared, auth state reset, redirect to home/login | Storage cleared, auth state reset, routed to `/` | **Passed** |
| **6. Session Persistence** | Preserves user session upon page refresh | Re-authenticated from stored credentials/token | **Passed** |
| **7. Candidate Route Protection** | Candidate cannot access recruiter or admin routes | Redirected to `/dashboard` with unauthorized warning | **Passed** |
| **8. Recruiter Route Protection** | Recruiter cannot access admin dashboard | Redirected to `/recruiter` with unauthorized warning | **Passed** |
| **9. Admin Route Protection** | Only role="admin" can view `/admin` | Non-admin users redirected with 403 Forbidden | **Passed** |
| **10. Job Search & Debounced Filter** | Results filter by title, location, skill without spamming API | Throttled by 400ms, accurately queries backend | **Passed** |
| **11. Pagination & Sorting** | Page controls update view, sort by salary/date works | Server pagination returns correct slice & page counts | **Passed** |
| **12. Transparent Skill Match UI** | Computes match percentage and displays matched skills | Correct percentage calculated, reason breakdown rendered | **Passed** |
| **13. Job Application Submission** | Accepts PDF <= 5MB, validates inputs, records application | Stored in database with "Pending" status | **Passed** |
| **14. Recruiter Job Management** | Recruiter can create, edit, and delete their jobs | CRUD operations execute and refresh job table | **Passed** |
| **15. Recruiter Status Update** | Updates applicant stage (Under Review, Interview, etc.) | Stage updated in DB, visible immediately to candidate | **Passed** |
| **16. Admin User Management** | Admin can view all users and toggle active status | Backend endpoint updates user status, reflected in UI | **Passed** |
| **17. Notification & Toast Alerts** | Instant toast alerts trigger on actions with sound feedback | Toasts appear at bottom-right and auto-dismiss | **Passed** |
| **18. Light / Dark Theme Toggle** | Theme toggle switches color variables and persists | Saved in `localStorage`, applied on initial load | **Passed** |
| **19. Responsive Layout** | Clean display across mobile drawers and desktop tables | Navigation drawer and flex layouts adapt smoothly | **Passed** |

---

## 🚀 Running the Project Locally in VS Code on Windows

### Prerequisites
- Node.js (v18.0.0 or later)
- MongoDB Atlas connection string (or local MongoDB)

### Step 1: Start the Backend Server

1. Open a new terminal in VS Code:
```powershell
cd "d:\DG intern\week8-backend"
```
2. Verify dependencies:
```powershell
npm install
```
3. Configure `.env` in `week8-backend/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```
4. Start the backend:
```powershell
npm run dev
```
*Backend runs at:* `http://localhost:5000`

---

### Step 2: Start the Frontend Application

1. Open a second terminal in VS Code:
```powershell
cd "d:\DG intern\week7-job-landing"
```
2. Verify dependencies:
```powershell
npm install
```
3. Verify `.env` in `week7-job-landing/`:
```env
VITE_API_URL=http://localhost:5000
```
4. Start Vite development server:
```powershell
npm run dev
```
*Frontend runs at:* `http://localhost:5173`

---

## 🌐 Application URLs

| Interface | URL | Access Level |
|---|---|---|
| **Public Portal & Landing** | `http://localhost:5173/` | Public |
| **Jobs & Internship Search** | `http://localhost:5173/jobs` | Public |
| **Login / Register** | `http://localhost:5173/login` | Public Only |
| **Candidate Dashboard** | `http://localhost:5173/dashboard` | Candidate / User |
| **My Applications** | `http://localhost:5173/my-applications` | Candidate / User |
| **User Profile** | `http://localhost:5173/profile` | Authenticated |
| **Recruiter Dashboard** | `http://localhost:5173/recruiter` | Recruiter / Employer |
| **Admin Dashboard** | `http://localhost:5173/admin` | Administrator |
| **Backend API Health Check** | `http://localhost:5000/api/health` | Public |