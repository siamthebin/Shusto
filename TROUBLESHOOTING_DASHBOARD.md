# Dashboard Button & Lab Access - Troubleshooting Guide

## Quick Verification Checklist

### ✅ Prerequisites
- [ ] You are logged in (profile icon visible in top right)
- [ ] Your email is in the `labs` table in Supabase
- [ ] Browser console is open (F12 → Console tab)
- [ ] JavaScript is enabled

### ✅ Expected Behavior Flow

```
1. Log in with bluebird3c@gmail.com
   ↓
2. See profile icon appear in top-right corner
   ↓
3. Click profile icon → menu opens
   ↓
4. See "ড্যাশবোর্ড" (Dashboard) button
   ↓
5. Click "ড্যাশবোর্ড" → redirects to /lab/dashboard
   ↓
6. Lab Dashboard loads successfully
```

---

## Console Logging - What You Should See

Open browser console and look for these logs (in order):

### Log 1: Role Detection Starts
```
[v0] Detecting role for email: bluebird3c@gmail.com
```

### Log 2: Lab Found in Database
```
[v0] Found LAB in database: {id: "abc123", name: "My Lab Name"}
```

If you see this, the dashboard button SHOULD appear. If it doesn't:
- Hard refresh browser (Ctrl+Shift+R)
- Check React DevTools to see if `dashboardPath` state updated

### Log 3: Dashboard Loads (when you visit /lab/dashboard)
```
[v0] Lab Dashboard: Checking Supabase auth...
[v0] Lab Dashboard: Auth user found: bluebird3c@gmail.com
[v0] Lab Dashboard: Lab found in database: My Lab Name
```

---

## Step-by-Step Debugging

### Step 1: Verify Email in Database

**In Supabase Dashboard**:
1. Open Supabase → Your Project → SQL Editor
2. Run this query:
   ```sql
   SELECT id, name, email FROM labs 
   WHERE email = 'bluebird3c@gmail.com';
   ```
3. **Result should show 1 row** with your lab data

**If no rows returned**:
- Email is NOT in labs table
- You need to add it via `/admin/add-lab` or manually insert in Supabase

### Step 2: Verify Authentication Works

**In Browser Console**:
```javascript
// Check if Supabase client is available
const supabase = window.supabase; // May not be global, but try
// OR reload page and immediately check profile page
```

**Or visit `/profile`**:
- If profile page loads and shows your email → Auth is working
- If profile page redirects to login → Auth is NOT working

### Step 3: Check Role Detection Code

**File**: `/components/kokonutui/top-bar.tsx` (Lines 56-155)

Look for this code pattern:
```typescript
const detectRole = async (email: string) => {
  // ...
  const { data: lab } = await supabase
    .from("labs")
    .select("id, name")
    .eq("email", email.toLowerCase())  // Case-insensitive!
    .single()

  if (lab) {
    console.log("[v0] Found LAB in database:", lab)
    setUserRole("lab")
    setDashboardPath("/lab/dashboard")  // This sets the path!
    return
  }
```

**What it does**:
1. Gets user email from Supabase auth
2. Queries `labs` table for matching email (case-insensitive)
3. If found, sets `dashboardPath` state to "/lab/dashboard"
4. Dashboard button appears in menu with that link

### Step 4: Check Dashboard Button Code

**File**: `/components/kokonutui/top-bar.tsx` (Lines 311-335)

Look for this code:
```typescript
{/* Show Dashboard button for providers */}
{dashboardPath && (  // ← If dashboardPath is set, show button
  <>
    <Link href={dashboardPath}>
      ...
      ড্যাশবোর্ড
    </Link>
  </>
)}
```

**If button doesn't appear**:
- `dashboardPath` is NOT being set
- Which means lab wasn't found in database
- OR role detection function never ran

### Step 5: Check Lab Dashboard Code

**File**: `/app/lab/dashboard/page.tsx` (Lines 53-88)

Look for this code:
```typescript
const loadLabData = async () => {
  // 1. Get Supabase auth user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) {
    console.error('[v0] Lab Dashboard: No user session found')
    router.push('/lab/login')  // Only kicks to login if NO AUTH
    return
  }

  // 2. Query labs table to verify user
  const { data: labData, error: labError } = await supabase
    .from('labs')
    .select('id, name, email, phone, address, license_number')
    .eq('email', user.email.toLowerCase())  // Case-insensitive!
    .single()

  if (labError || !labData) {
    console.error('[v0] Lab Dashboard: User not found in labs table')
    setError('...') // Show error, don't kick to login
    return
  }

  setLab(labData)  // Success! Set lab data and load orders
}
```

**Key Change**: 
- OLD: Checked `localStorage.getItem('labData')` → would kick you out if empty
- NEW: Checks `supabase.auth.getUser()` → allows OAuth users

---

## Real-World Test Cases

### Test Case 1: "Button Appears but Doesn't Work"
**Symptoms**: Button shows in menu, clicking it goes to blank page

**Diagnosis**:
1. Open console on /lab/dashboard
2. Check for error messages
3. If you see "[v0] Lab Dashboard: User not found in labs table":
   - Your auth email doesn't match labs table email
   - Example: logged in as "BlueB1rd@GMAIL.com" but table has "bluebird3c@gmail.com"
   - Solution: Delete account, re-register with exact email

### Test Case 2: "Button Doesn't Appear at All"
**Symptoms**: Click profile → see Profile, My Orders, Wallet, Logout (but NO Dashboard button)

**Diagnosis**:
1. Open console
2. If you don't see "[v0] Found LAB in database:" log:
   - Email is not in labs table
   - Run query from Step 1 to verify
3. If you see the log but button still doesn't appear:
   - Hard refresh browser (Ctrl+Shift+R)
   - Open React DevTools → Components → TopBar → check `dashboardPath` state

### Test Case 3: "Direct Access /lab/dashboard Works, But Button Still Missing"
**Symptoms**: 
- You can visit `/lab/dashboard` manually and it works
- But menu button doesn't appear

**Diagnosis**:
- Role detection is failing silently
- Check console for errors before "Found LAB" log
- Might be a race condition - TopBar component rendering before role detection completes
- Solution: Hard refresh, or wait a few seconds for async operations

---

## Network Debugging

### Check Supabase Requests

In browser DevTools → Network tab:

1. **Look for**: GET request to `/labs` table
   - Should have your email in the query
   - Should return 200 status with your lab data

2. **Expected response** (example):
   ```json
   {
     "id": "abc-123-def",
     "name": "My Lab",
     "email": "bluebird3c@gmail.com"
   }
   ```

3. **If you see 404 or error**:
   - Supabase query failed
   - Check table name (should be `labs` not `lab`)
   - Check column name (should be `email` not `mail`)

### Check Auth Status

In browser DevTools → Application → Cookies:

1. Look for cookie: `sb-{project-id}-auth-token`
2. If you DON'T see this → You are not logged in
3. If you DO see this → Auth is working, issue is with role detection

---

## The Two Authorization Systems

### System 1: Old Method (Legacy)
- Used `localStorage.getItem('labData')`
- Used for `/lab/login` form submissions
- Would lose access on browser refresh
- **Now only used as fallback**

### System 2: New Method (OAuth/Supabase Auth)
- Uses `supabase.auth.getUser()`
- Used after OAuth login
- Persists across browser refreshes
- **This is the primary method**

**Why the change?**
- OAuth users don't have `labData` in localStorage
- They authenticate via Supabase sessions
- We need to query the database to verify their role

---

## Quick Commands for Testing

Run these in browser console:

### Check Supabase Auth Status
```javascript
// Check if user is logged in
const user = localStorage.getItem('sb-auth-user');
console.log(JSON.parse(user || '{}'));
```

### Check Lab Data in Database (if you're an admin)
```javascript
// In Supabase SQL Editor:
SELECT COUNT(*) as total_labs FROM labs;
SELECT * FROM labs WHERE email LIKE '%bluebird%';
```

### Manually Trigger Role Detection
```javascript
// Copy the detectRole function from TopBar and run it
// (Advanced - requires understanding the code structure)
```

---

## Contact Support

If dashboard button still doesn't appear after all steps:

**Collect this information**:
1. Your email address
2. Output of this console command:
   ```javascript
   console.log(localStorage.getItem('sb-auth-user'))
   ```
3. Screenshot of browser console logs (F12 → Console)
4. Screenshot of Supabase Labs table showing your entry

**Then describe**:
- What did you do?
- What did you expect to happen?
- What actually happened?
- Any error messages you see?
