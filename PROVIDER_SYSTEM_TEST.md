# Provider Dashboard System - Quick Test Guide

## 🎯 What Was Fixed

**Problem:** Providers (Pharmacy, Lab, Hospital, Ambulance, Physio) couldn't login because:
- Admin add APIs were saving to **NEON** database
- Login pages were trying to read from **SUPABASE** database
- Dashboard protection was checking Supabase (empty tables)

**Solution:** 
- ✅ All provider add APIs now use **Supabase ONLY**
- ✅ All provider login APIs now use **Supabase ONLY**
- ✅ All dashboards now work with Supabase data
- ✅ Complete provider isolation - each provider has their own dashboard

---

## 🧪 How to Test

### Test Pharmacy System (Complete Example)

#### Step 1: Add Pharmacy as Admin
1. Go to `/admin/add-pharmacy`
2. Fill in the form:
   - **ফার্মেসির নাম:** "Test Pharmacy"
   - **ইমেইল:** `pharmacy@test.com`
   - **ফোন:** `01912345678`
   - **ঠিকানা:** "Test Address"
   - **লাইসেন্স নম্বর:** `DL-123456`
   - **মালিকের নাম:** "Owner Name"
   - **অক্ষাংশ:** `23.8103`
   - **দ্রাঘিমাংশ:** `90.4125`
3. Click "ফার্মেসি যোগ করুন"
4. ✅ Should see success message: "ফার্মেসি সফলভাবে যোগ করা হয়েছে"

**What happens behind the scenes:**
- `POST /api/admin/add-pharmacy` is called
- Pharmacy data is inserted into Supabase `pharmacies` table
- Database now has the pharmacy with email: `pharmacy@test.com`

#### Step 2: Pharmacy Login
1. Go to `/pharmacy/login`
2. Enter email: `pharmacy@test.com`
3. Click "লগ ইন করুন"
4. ✅ Should redirect to `/pharmacy/dashboard`
5. ✅ Dashboard should show pharmacy info

**What happens behind the scenes:**
- `POST /api/pharmacy/login` with email
- System queries Supabase `pharmacies` table
- Finds pharmacy and returns data
- Stores in localStorage
- Protects dashboard using `protectDashboard('pharmacy')`

---

### Apply Same Pattern for Other Providers

| Provider | Add Page | Login Page | Dashboard |
|----------|----------|-----------|-----------|
| Lab | `/admin/add-lab` | `/lab/login` | `/lab/dashboard` |
| Hospital | `/admin/add-hospital` | `/hospital/login` | `/hospital/dashboard` |
| Ambulance | `/admin/add-ambulance` | `/ambulance/login` | `/ambulance/dashboard` |
| Physio | `/admin/add-physio` | `/physio/login` | `/physio/dashboard` |

---

## ✅ Success Indicators

### When Adding Provider
- [ ] Form submission works without errors
- [ ] Success message appears
- [ ] Redirects to provider list
- [ ] New provider appears in Supabase table

### When Logging In
- [ ] Email field accepts the email used during add
- [ ] Login button works
- [ ] Redirects to dashboard page
- [ ] No "unauthorized access" errors

### Dashboard Access
- [ ] Dashboard page loads completely
- [ ] Shows provider information (name, email, phone, etc.)
- [ ] Shows provider-specific data (orders, appointments, etc.)
- [ ] Can perform provider-specific actions

---

## 🔍 Debugging Tips

### Check if Pharmacy was Added to Supabase
1. Go to Supabase dashboard
2. Check `pharmacies` table
3. Look for row with email: `pharmacy@test.com`
4. Verify all fields are populated

### Check Login API Response
1. Open browser DevTools (F12)
2. Go to Network tab
3. Go to `/pharmacy/login`
4. Enter email and submit
5. Look for `POST /api/pharmacy/login`
6. Check Response tab for the pharmacy data

### Check Dashboard Protection
1. Open browser Console (F12 > Console)
2. Look for `[v0]` debug logs
3. Should see messages like:
   - `[v0] Dashboard Protection: Checking access for email: pharmacy@test.com`
   - `[v0] Dashboard Protection: Pharmacy authorized - Test Pharmacy`

### Check localStorage
1. Open DevTools (F12)
2. Go to Application > Local Storage
3. Look for:
   - `pharmacyEmail` = `pharmacy@test.com`
   - `pharmacyData` = pharmacy JSON object

---

## 📋 Complete Test Checklist

```
[ ] Pharmacy System
    [ ] Add pharmacy works
    [ ] Data in Supabase
    [ ] Login works
    [ ] Dashboard loads
    
[ ] Lab System
    [ ] Add lab works
    [ ] Data in Supabase
    [ ] Login works
    [ ] Dashboard loads
    
[ ] Hospital System
    [ ] Add hospital works
    [ ] Data in Supabase
    [ ] Login works
    [ ] Dashboard loads
    
[ ] Ambulance System
    [ ] Add ambulance works
    [ ] Data in Supabase
    [ ] Login works
    [ ] Dashboard loads
    
[ ] Physio System
    [ ] Add physio works
    [ ] Data in Supabase
    [ ] Login works
    [ ] Dashboard loads
```

---

## 🚀 Next Steps

After confirming all tests pass:
1. Verify provider dashboards show live orders/data
2. Test dashboard protection (try accessing other provider's dashboard - should fail)
3. Test database queries in each dashboard
4. Ensure localStorage clears on logout
5. Test with multiple providers simultaneously

---

## 📚 Key Files Modified

**Add APIs (All to Supabase):**
- `/app/api/admin/add-pharmacy/route.ts`
- `/app/api/admin/add-lab/route.ts`
- `/app/api/admin/add-hospital/route.ts`
- `/app/api/admin/add-ambulance/route.ts`
- `/app/api/admin/add-physio/route.ts`

**Login APIs (All to Supabase):**
- `/app/api/pharmacy/login/route.ts` (NEW)
- `/app/api/lab/login/route.ts`
- `/app/api/hospital/login/route.ts`
- `/app/api/ambulance/login/route.ts`
- `/app/api/physio/login/route.ts`

**New Pages:**
- `/app/pharmacy/login/page.tsx` (NEW)

**Protection Logic:**
- `/lib/dashboard-protection.ts` (Uses Supabase for all roles)
