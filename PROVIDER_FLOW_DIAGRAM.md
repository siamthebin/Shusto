# Provider Dashboard System - Complete Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                              │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ├─ Add Pharmacy → /admin/add-pharmacy
           ├─ Add Lab → /admin/add-lab
           ├─ Add Hospital → /admin/add-hospital
           ├─ Add Ambulance → /admin/add-ambulance
           └─ Add Physio → /admin/add-physio
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ADD PROVIDER API                               │
│  POST /api/admin/add-[provider]/route.ts                        │
│                                                                 │
│  ✅ Supabase Client                                             │
│  → Insert into [provider] table                                 │
│  → email: lowercase                                             │
│  → paused: false, is_active: true                               │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ pharmacies table                                        │   │
│  │ ├─ id, name, email, phone, address, ...               │   │
│  │ ├─ Row: pharmacy@test.com | Test Pharmacy            │   │
│  │ └─ Row: pharmacy2@test.com | Test Pharmacy 2         │   │
│  ├─ labs table                                            │   │
│  │ ├─ id, name, email, phone, address, ...               │   │
│  │ └─ Row: lab@test.com | Test Lab                      │   │
│  ├─ hospitals table                                       │   │
│  │ ├─ id, name, email, phone, address, ...               │   │
│  │ └─ Row: hospital@test.com | Test Hospital            │   │
│  ├─ ambulance table                                       │   │
│  │ ├─ id, name, email, phone, driver_name, ...           │   │
│  │ └─ Row: ambulance@test.com | Ambulance Service       │   │
│  └─ physio table                                          │   │
│    ├─ id, name, email, phone, address, ...               │   │
│    └─ Row: physio@test.com | Test Physio               │   │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ (Data saved successfully!)
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PROVIDER LOGIN                               │
│  POST /[provider]/login → Redirect to Dashboard                │
└────────┬────────────────────────────────────────────────────────┘
         │
         ├─ Provider goes to /pharmacy/login
         │  → Enters: pharmacy@test.com
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│              LOGIN API (POST /api/pharmacy/login)               │
│                                                                 │
│  1. Get email from request body                               │
│  2. Query Supabase:                                           │
│     .from("pharmacies")                                       │
│     .select("*")                                              │
│     .eq("email", email.toLowerCase())                         │
│  3. Find pharmacy in database ✅                              │
│  4. Return pharmacy data                                      │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│              BROWSER LOCALSTORAGE                               │
│                                                                 │
│  pharmacyEmail = "pharmacy@test.com"                           │
│  pharmacyData = {                                              │
│    "id": "123",                                                │
│    "name": "Test Pharmacy",                                    │
│    "email": "pharmacy@test.com",                               │
│    "phone": "01912345678",                                     │
│    "address": "Test Address",                                  │
│    "license_number": "DL-123456"                               │
│  }                                                              │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ▼ (Redirect to /pharmacy/dashboard)
           │
┌─────────────────────────────────────────────────────────────────┐
│            DASHBOARD PAGE PROTECTION                            │
│          /app/pharmacy/dashboard/page.tsx                       │
│                                                                 │
│  On Load:                                                       │
│  1. Check localStorage for pharmacyEmail                       │
│  2. Call protectDashboard('pharmacy')                          │
│  3. Function checks Supabase auth                              │
│  4. Query: .from("pharmacies")                                 │
│           .select("*")                                         │
│           .eq("email", user.email)                             │
│  5. Return ✅ if authorized                                    │
│     Return ❌ if not authorized                                │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ├─ ✅ AUTHORIZED
           │   └─ Load Dashboard
           │       ├─ Show Pharmacy Info
           │       ├─ Show Orders
           │       ├─ Show Profile
           │       └─ Show Settings
           │
           └─ ❌ NOT AUTHORIZED
               └─ Redirect to /
```

---

## Data Flow Diagram

```
FLOW 1: ADD PROVIDER (Admin Side)
═════════════════════════════════

Admin Form Input
    ↓
    ├─ Name, Email, Phone, Address, etc.
    ↓
POST /api/admin/add-pharmacy
    ↓
    ├─ Validate input
    ├─ Create Supabase client
    ├─ Insert into pharmacies table
    │  └─ email: lowercase
    │  └─ paused: false
    └─ Return success
       ↓
       Show Success Message
       Redirect to /admin/pharmacies


FLOW 2: LOGIN (Provider Side)
════════════════════════════

Provider enters email at /pharmacy/login
    ↓
POST /api/pharmacy/login
    ↓
    ├─ Get email from body
    ├─ Create Supabase client
    ├─ Query pharmacies table
    │  └─ WHERE email = pharmacy@test.com
    ├─ Return pharmacy data
    └─ If found: ✅ Success
       If not: ❌ Error
       ↓
localStorage.setItem("pharmacyEmail", email)
localStorage.setItem("pharmacyData", JSON.stringify(data))
    ↓
Router.push("/pharmacy/dashboard")


FLOW 3: DASHBOARD ACCESS (Provider Side)
═════════════════════════════════════════

Load /pharmacy/dashboard
    ↓
Call protectDashboard("pharmacy")
    ↓
    ├─ Check Supabase auth
    ├─ Get user.email
    ├─ Query: .from("pharmacies")
    │         .eq("email", user.email)
    ├─ Return provider data if found
    └─ Return error if not found
       ↓
    ✅ AUTHORIZED → Load dashboard with data
    ❌ NOT AUTHORIZED → Redirect to /
```

---

## Key Points

### 1. **Data Consistency**
- All provider data lives in **ONE Supabase database**
- No Neon database involved for providers
- Each provider table is independent

### 2. **Email-Based Authentication**
- Providers login using email (no password initially)
- Email is stored in lowercase in Supabase
- Email is case-insensitive for login

### 3. **Dashboard Protection**
- `protectDashboard()` function validates provider
- Checks Supabase for logged-in user
- Prevents cross-provider access
- Each provider sees only their data

### 4. **localStorage Usage**
- Stores provider email for quick lookup
- Stores provider data for dashboard display
- Cleared on logout
- Used for client-side validation

### 5. **API Architecture**
```
Add API          Login API         Dashboard
────────         ─────────         ──────────
POST request  →  GET from DB   →   protectDashboard()
│                │                 │
└→ Insert        └→ Return         └→ Check + Load
  into DB           provider data     provider data
```

---

## Error Handling

### Add Provider Fails
```
Form Submission
    ↓
Validation Error or DB Error
    ↓
Show Error Message
    ↓
User stays on form page
```

### Login Fails
```
Enter Email & Submit
    ↓
API: Query Supabase
    ↓
No results found
    ↓
Return 404 error
    ↓
Show: "এই email দিয়ে কোনো ফার্মেসি পাওয়া যায়নি"
    ↓
User stays on login page
```

### Dashboard Access Fails
```
Load /pharmacy/dashboard
    ↓
Call protectDashboard("pharmacy")
    ↓
No user logged in
or
User not in pharmacies table
    ↓
Return error
    ↓
Redirect to / (home page)
```

---

## Security Model

```
Provider Isolation
═════════════════

User A (pharmacy@test.com) → Can only see pharmacy data
User B (lab@test.com) → Can only see lab data
User C (hospital@test.com) → Can only see hospital data

Each user's email is checked against THEIR provider table.
Cannot access other provider tables.
```

---

## Files Involved

```
📁 Provider System Files
├── 📁 API Routes
│   ├── api/admin/add-pharmacy/ ✅ → Supabase
│   ├── api/admin/add-lab/ ✅ → Supabase
│   ├── api/admin/add-hospital/ ✅ → Supabase
│   ├── api/admin/add-ambulance/ ✅ → Supabase
│   ├── api/admin/add-physio/ ✅ → Supabase
│   ├── api/pharmacy/login/ ✅ → Supabase (NEW)
│   ├── api/lab/login/ ✅ → Supabase
│   ├── api/hospital/login/ ✅ → Supabase
│   ├── api/ambulance/login/ ✅ → Supabase
│   └── api/physio/login/ ✅ → Supabase
│
├── 📁 Login Pages
│   ├── pharmacy/login/page.tsx ✅ (NEW)
│   ├── lab/login/page.tsx ✅
│   ├── hospital/login/page.tsx ✅
│   ├── ambulance/login/page.tsx ✅
│   └── physio/login/page.tsx ✅
│
├── 📁 Dashboards
│   ├── pharmacy/dashboard/ ✅
│   ├── lab/dashboard/ ✅
│   ├── hospital/dashboard/ ✅
│   ├── ambulance/dashboard/ ✅
│   └── physio/dashboard/ ✅
│
├── 📁 Admin Pages
│   ├── admin/add-pharmacy/page.tsx ✅
│   ├── admin/add-lab/page.tsx ✅
│   ├── admin/add-hospital/page.tsx ✅
│   ├── admin/add-ambulance/page.tsx ✅
│   └── admin/add-physio/page.tsx ✅
│
└── 📁 Utilities
    └── lib/dashboard-protection.ts ✅
        (Uses Supabase for all provider roles)
```

---

## Summary

✅ **Provider System Complete**
- All add APIs use Supabase
- All login APIs use Supabase
- All dashboards use Supabase
- Complete data isolation between providers
- Email-based authentication
- Protected dashboard access
