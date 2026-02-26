# Quick Verification Guide

## Test Environment

### Step 1: Test Account Setup
Ensure you have these test accounts in Supabase:

**Physio Account:**
```
Email: moniruzzamanmoni1987@gmail.com
Password: [your-password]
In physio table: ✓ Found
```

**Lab Account:**
```
Email: bluebird3c@gmail.com
Password: [your-password]
In labs table: ✓ Found
```

---

## Test Sequence

### Part A: Dashboard Button in Menu (2 minutes)

**Step 1a:** Login as Physio
```
1. Go to https://shusto.com
2. Click profile icon (top right)
3. Click "লগইন করুন" (Sign In)
4. Email: moniruzzamanmoni1987@gmail.com
5. Password: [enter-password]
6. Click "লগইন" (Sign In)
```

**Step 1b:** Check Menu
```
1. After login, click profile icon again
2. Verify you see these in dropdown:
   ✓ Email: moniruzzamanmoni1987@gmail.com
   ✓ Role: physio
   ✓ GREEN BUTTON: ড্যাশবোর্ড (NEW!)
   ✓ প্রোফাইল (Profile)
   ✓ আমার অর্ডার (My Orders)
   ✓ ওয়ালেট (Wallet)
   ✓ লগআউট (Logout in red)
```

**Step 1c:** Check Console
```
1. Open DevTools (F12)
2. Go to Console tab
3. You should see:
   [v0] Detecting role for email: moniruzzamanmoni1987@gmail.com
   [v0] Found PHYSIO in database: {...}
   [v0] Dashboard path set to: /physio/dashboard
```

**Step 1d:** Click Dashboard Button
```
1. Click green "ড্যাশবোর্ড" button
2. Verify page loads at /physio/dashboard
3. Check you see provider info:
   - Name: Md. Moniruzzaman
   - Email: moniruzzamanmoni1987@gmail.com
   - Phone: 01938838141
   - Address: DPC Physiotherapy Clinic...
```

---

### Part B: Provider-Specific Orders (2 minutes)

**Step 2a:** Check Physio Orders
```
1. You're already at /physio/dashboard
2. Scroll down to "রোগীর বুকিং" section
3. You should see ONLY this physio's appointments
4. Not: Lab orders, Doctor appointments, other physios
```

**Step 2b:** Check Console for Order Fetch
```
1. In DevTools Console, you should see:
   [v0] Fetching physio orders for physio_id: [some-uuid]
   [v0] Fetched appointments: 3
```

**Step 2c:** Test with Lab Account (NEW TAB)
```
1. In a NEW BROWSER TAB, login as Lab:
   Email: bluebird3c@gmail.com
   Password: [enter-password]
2. Click profile icon → ড্যাশবোর্ড
3. Should go to /lab/dashboard (NOT /physio/dashboard)
4. Should show LAB's information:
   - Name: [Lab Name]
   - Email: bluebird3c@gmail.com
5. Lab orders should be DIFFERENT from Physio orders
```

---

### Part C: Real-time Sync (3 minutes)

**Step 3a:** Setup for Real-time Test
```
1. Keep Physio Dashboard open in Tab 1
2. Open patient booking page in Tab 2:
   https://shusto.com/book-service
3. Stay on same browser (not incognito)
```

**Step 3b:** Place New Appointment
```
1. In Tab 2 (booking page), search for:
   "Md. Moniruzzaman" OR "DPC Physiotherapy"
2. Click on the physio service
3. Fill booking form:
   - Your name: [Test Name]
   - Your email: [your-email@gmail.com]
   - Your phone: [your-phone]
   - Date: [any future date]
   - Time: [any time]
4. Click "বুকিং করুন" (Book)
5. Complete payment (or skip if in dev mode)
```

**Step 3c:** Check Real-time Update
```
1. Switch back to Tab 1 (Physio Dashboard)
2. IMPORTANT: Don't refresh the page!
3. Scroll down to "রোগীর বুকিং" section
4. NEW appointment should appear INSTANTLY
   - If 1 second delay → Perfect ✓
   - If 1-2 seconds delay → Good ✓
   - If no change after 5 seconds → Check console
```

**Step 3d:** Check Console for Real-time Event
```
1. In Tab 1 DevTools Console, look for:
   [v0] Setting up Realtime subscription for physio: [id]
   [v0] Realtime update received: {
     eventType: 'INSERT',
     new: {id: "...", patient_name: "[Test Name]", ...}
   }
```

---

## Expected Results

### ✅ All Tests Pass
- Dashboard button appears in menu for providers only
- Physio sees only their appointments
- Lab sees only their appointments
- New appointments appear instantly without page refresh
- Console shows proper debug logs

### ⚠️ Dashboard Button Not Showing
**Check 1:** Email in auth matches email in provider table (case-insensitive)
```sql
SELECT email FROM physio WHERE email = 'moniruzzamanmoni1987@gmail.com';
```

**Check 2:** Console shows role detection running
```
[v0] Detecting role for email: [your-email]
[v0] Found PHYSIO in database: ...
```

**Check 3:** Try hard refresh (Ctrl+F5) to clear cache

### ⚠️ Wrong Orders Showing
**Check:** Verify physio_id in appointments table matches physio.id
```sql
SELECT id FROM physio WHERE email = 'moniruzzamanmoni1987@gmail.com';
SELECT * FROM appointments WHERE physio_id = '[above-id]';
```

### ⚠️ Real-time Not Working
**Check 1:** Enable Realtime in Supabase Dashboard
- Settings → Realtime
- Toggle ON for `appointments` table

**Check 2:** Verify filter is working
```sql
SELECT * FROM appointments WHERE physio_id = '[physio-id]' LIMIT 5;
```

**Check 3:** Check browser console for subscription errors

---

## Browser DevTools - What to Watch

### Network Tab
- Should NOT see full page reload when order appears
- Only WebSocket connections to Supabase (Real-time)

### Console Tab
- No CORS errors
- No "PGRST" database errors
- Proper [v0] logs visible

### Application Tab
- Supabase session stored in localStorage
- Auth tokens present

---

## Duration Estimates

| Test | Time |
|------|------|
| Part A (Dashboard Button) | 2 min |
| Part B (Provider Orders) | 2 min |
| Part C (Real-time) | 3 min |
| **TOTAL** | **~7 min** |

---

## Rollback Instructions

If anything breaks:

1. **Dashboard button not showing:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+F5)
   - Check console for role detection errors

2. **Wrong orders showing:**
   - Check database for physio_id values
   - Verify appointment table has physio_id column

3. **Real-time not working:**
   - Disable/enable Realtime in Supabase
   - Clear browser cache
   - Reload page

---

## Success Indicators

✅ **Dashboard Button Test:**
- [x] Button visible in profile menu
- [x] Correct role shown
- [x] Navigates to correct dashboard
- [x] Provider info displays

✅ **Provider Order Test:**
- [x] Only provider's orders showing
- [x] Different providers see different data
- [x] Console shows correct physio_id

✅ **Real-time Test:**
- [x] New order appears without refresh
- [x] Appears within 1-2 seconds
- [x] Status updates in real-time
- [x] Cancelled orders disappear instantly

All green = Fixes working perfectly! ✅
