# Role Detection Code Reference

## Problem Fixed
- **Issue 1**: Dashboard button not appearing in menu for bluebird3c@gmail.com even though email exists in labs table
- **Issue 2**: Visiting /lab/dashboard manually would kick you out to /lab/login
- **Issue 3**: No way to see where role checking happens

## Solution Overview

### 1. TopBar Component - WHERE THE DASHBOARD BUTTON NOW APPEARS
**File**: `/components/kokonutui/top-bar.tsx`

#### New State Variables (Lines 32-35):
```typescript
const [userRole, setUserRole] = useState<string | null>(null)
const [dashboardPath, setDashboardPath] = useState<string | null>(null)
const supabase = createClient()
```

#### Role Detection Function (Lines 68-155):
```typescript
const detectRole = async (email: string) => {
  try {
    console.log("[v0] Detecting role for email:", email)
    
    // CHECKS LABS TABLE FIRST
    const { data: lab } = await supabase
      .from("labs")
      .select("id, name")
      .eq("email", email.toLowerCase())
      .single()

    if (lab) {
      console.log("[v0] Found LAB in database:", lab)
      setUserRole("lab")
      setDashboardPath("/lab/dashboard")  // ← SETS DASHBOARD PATH
      return
    }

    // Then checks doctors, hospitals, pharmacies, physio, ambulance...
    // Same pattern for each provider type
```

#### Dashboard Button in Menu (Lines 311-335):
```typescript
{/* Show Dashboard button for providers */}
{dashboardPath && (
  <>
    <Link
      href={dashboardPath}  // ← REDIRECTS TO /lab/dashboard
      className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600..."
    >
      <svg>...</svg>
      ড্যাশবোর্ড
    </Link>
    <div className="border-t..." />
  </>
)}
```

**How it Works**:
1. When user logs in, `useEffect` calls `detectRole(user.email)`
2. `detectRole()` queries Supabase tables in this order:
   - `labs` table
   - `doctors` table
   - `hospitals` table
   - `pharmacies` table
   - `physio` table
   - `ambulance` table
3. When a match is found (e.g., bluebird3c@gmail.com in labs), it sets:
   - `userRole = "lab"`
   - `dashboardPath = "/lab/dashboard"`
4. The Dashboard button appears in the user menu with a link to `/lab/dashboard`

---

### 2. Lab Dashboard - HARD-CODED TO ACCEPT SUPABASE AUTH
**File**: `/app/lab/dashboard/page.tsx`

#### Authentication Check (Lines 53-88):
```typescript
const loadLabData = async () => {
  try {
    console.log('[v0] Lab Dashboard: Checking Supabase auth...')
    
    // GET AUTHENTICATED USER FROM SUPABASE
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.email) {
      // Fallback to localStorage for legacy sessions
      const labData = localStorage.getItem('labData')
      if (!labData) {
        console.error('[v0] Lab Dashboard: No user session found')
        router.push('/lab/login')
        return
      }
      // ... legacy handling
    }

    console.log('[v0] Lab Dashboard: Auth user found:', user.email)
    
    // VERIFY USER IS IN LABS TABLE
    const { data: labData, error: labError } = await supabase
      .from('labs')
      .select('id, name, email, phone, address, license_number')
      .eq('email', user.email.toLowerCase())  // ← CASE-INSENSITIVE MATCH
      .single()

    if (labError || !labData) {
      console.error('[v0] Lab Dashboard: User not found in labs table', labError)
      setError('आप एक lab नहीं हैं। कृपया सही खाते से लॉगिन करें।')
      return
    }

    console.log('[v0] Lab Dashboard: Lab found in database:', labData.name)
    setLab(labData as LabData)
    fetchOrders(labData.id)
  } catch (err) {
    console.error('[v0] Lab Dashboard: Unexpected error:', err)
    setError('Dashboard लोड करने में त्रुटि हुई')
    setLoading(false)
  }
}
```

**Key Changes**:
1. Uses `supabase.auth.getUser()` instead of `localStorage.getItem('labData')`
2. Queries the actual `labs` table to verify the user exists
3. Email comparison is **case-insensitive** (`email.toLowerCase()`)
4. If user is not in labs table, shows error instead of kicking to login
5. Supports both OAuth and legacy localStorage sessions

#### Error Handling (Lines 112-129):
```typescript
if (error) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200">
        <h1 className="text-2xl font-bold text-red-600 mb-4">অ্যাক্সেস অস্বীকৃত</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          লগআউট করুন
        </button>
      </div>
    </div>
  )
}
```

---

## Testing Instructions

### Test 1: Dashboard Button Appears
1. Login with email: `bluebird3c@gmail.com`
2. Click the profile icon (top right)
3. **Expected**: You should see "ড্যাশবোর্ড" button in the menu
4. **Check Console**: You should see logs like:
   ```
   [v0] Detecting role for email: bluebird3c@gmail.com
   [v0] Found LAB in database: {id: "...", name: "..."}
   ```

### Test 2: Manual /lab/dashboard Access
1. Open browser console
2. Paste: `window.location.href = '/lab/dashboard'`
3. **Expected**: You should NOT be kicked out; dashboard should load
4. **Check Console**: You should see logs like:
   ```
   [v0] Lab Dashboard: Checking Supabase auth...
   [v0] Lab Dashboard: Auth user found: bluebird3c@gmail.com
   [v0] Lab Dashboard: Lab found in database: Lab Name Here
   ```

### Test 3: Wrong Role Redirection
1. Login with patient account (email not in any provider table)
2. Click profile icon
3. **Expected**: No Dashboard button appears (only Profile, My Orders, Wallet)
4. If you try to manually access `/lab/dashboard`:
   - **Expected**: Error message: "आप एक lab नहीं हैं। कृपया सही खाते से लॉगिन करें।"

---

## Code Flow Diagram

```
User Login (OAuth)
    ↓
app/auth/callback/route.ts (calls detectUserRole)
    ↓
lib/role-detection.ts (queries all provider tables)
    ↓
Database: Checks labs table for email match
    ↓
Found! Returns role="lab", id, name
    ↓
Sets displayName in profile, redirects to /lab/dashboard
    ↓
User lands on /lab/dashboard
    ↓
Lab Dashboard useEffect checks:
  1. Is user authenticated via Supabase? ✓
  2. Does user exist in labs table? ✓
  3. Load lab data and orders
    ↓
Dashboard displays successfully
```

---

## Database Tables Being Checked (In Order)

1. **labs** table
   - Columns: `id`, `name`, `email` (unique, lowercase)
   
2. **doctors** table
   - Columns: `id`, `full_name`, `email` (unique, lowercase)

3. **hospitals** table
   - Columns: `id`, `name`, `email` (unique, lowercase)

4. **pharmacies** table
   - Columns: `id`, `name`, `email` (unique, lowercase)

5. **physio** table
   - Columns: `id`, `name`, `email` (unique, lowercase)

6. **ambulance** table
   - Columns: `id`, `driver_name`, `email` (unique, lowercase)

---

## Common Issues & Solutions

### Issue: Dashboard button not showing
**Solutions**:
1. Check browser console for role detection errors
2. Verify email is exactly in the labs table (case doesn't matter)
3. Ensure Supabase auth is working (`/profile` page loads)

### Issue: Getting kicked to /lab/login
**Solutions**:
1. Check if you're logged in via browser console:
   ```javascript
   const supabase = supabase_client; // if available
   const { data } = await supabase.auth.getUser();
   console.log(data.user); // should show your user
   ```
2. Check if your email exists in labs table:
   ```sql
   SELECT * FROM labs WHERE email = 'bluebird3c@gmail.com';
   ```

### Issue: Console shows "Found LAB" but button doesn't appear
**Solutions**:
1. Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check if `dashboardPath` state is being set in React DevTools
3. Verify profile menu is opening (click account icon)
