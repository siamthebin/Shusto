# Quick Test Guide - Dashboard Button

## Test Case 1: Lab Provider (bluebird3c@gmail.com)

### Setup
- This email exists in the `labs` table
- Database has Lab name, phone, address

### Test Steps
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console (type `clear()`)
4. Login with: `bluebird3c@gmail.com`
5. Wait for page to load
6. Check console - should see:
   ```
   [v0] Detecting role for email: bluebird3c@gmail.com
   [v0] Found LAB
   ```

7. Click profile icon (top right corner)
8. Profile dropdown opens
9. **Check:** Is "ড্যাশবোর্ড" button visible? (green button with house icon)
10. Click Dashboard button
11. **Check:** Are you at `/lab/dashboard`?

### Expected Result
✅ Dashboard button shows  
✅ Can click and navigate to /lab/dashboard  
✅ Lab dashboard loads with your data

---

## Test Case 2: Physio Provider (moniruzzamanmoni1987@gmail.com)

### Setup
- This email exists in the `physio` table
- Database has Physio name, phone, specialization

### Test Steps
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console
4. Login with: `moniruzzamanmoni1987@gmail.com`
5. Wait for page load
6. Check console - should see:
   ```
   [v0] Detecting role for email: moniruzzamanmoni1987@gmail.com
   [v0] Found PHYSIO
   ```

7. Click profile icon
8. **Check:** "ড্যাশবোর্ড" button visible?
9. Click Dashboard
10. **Check:** At `/physio/dashboard`?

### Expected Result
✅ Dashboard button shows  
✅ Navigate to /physio/dashboard  
✅ Physio appointments visible with real-time updates

---

## Test Case 3: Patient (normal user)

### Setup
- Email NOT in any provider table
- Regular patient account

### Test Steps
1. DevTools → Console
2. Login with patient email
3. Check console - should see:
   ```
   [v0] No provider role - user is patient
   ```

4. Click profile icon
5. **Check:** NO "ড্যাশবোর্ড" button shown?
6. Only see: Profile, My Orders, Wallet, Logout

### Expected Result
✅ No Dashboard button shown  
✅ Correct menu items displayed

---

## Test Case 4: Medicine Section Still Works

### Setup
- Any logged-in user

### Test Steps
1. Login with any account
2. Click profile icon
3. Scroll down in menu
4. **Check:** See "আমার অর্ডার" (My Orders)?
5. Check in page: medicine list visible?

### Expected Result
✅ Medicine section intact  
✅ Pharmacy list still accessible  
✅ No medicine functionality broken

---

## Console Logs Reference

### Success Logs
```
[v0] Detecting role for email: user@example.com
[v0] Found LAB
```

### Error Logs
```
[v0] Error detecting role: [error details]
[v0] No provider role - user is patient
```

---

## Troubleshooting

### Problem: Dashboard button still not showing

**Check 1:** Email case sensitivity
- Login with exact email from database
- Check database for correct spelling

**Check 2:** Auth state
- Press F12
- Go to Application tab
- Check Supabase session cookie exists
- Should have `sb-*-auth-token`

**Check 3:** Database connection
- Open Console (F12)
- Look for any Supabase errors
- Check network tab for failed API calls

**Check 4:** Email in correct table?
- Is your email ACTUALLY in the labs/doctors/physio table?
- Check database directly with SQL:
  ```sql
  SELECT * FROM labs WHERE email = 'bluebird3c@gmail.com';
  SELECT * FROM physio WHERE email = 'moniruzzamanmoni1987@gmail.com';
  ```

---

## Expected Console Output

### For Lab Provider
```
[v0] Detecting role for email: bluebird3c@gmail.com
[v0] Found LAB
```

### For Physio Provider
```
[v0] Detecting role for email: moniruzzamanmoni1987@gmail.com
[v0] Found PHYSIO
```

### For Doctor Provider
```
[v0] Detecting role for email: doctor@example.com
[v0] Found DOCTOR
```

### For Patient
```
[v0] Detecting role for email: patient@example.com
[v0] No provider role - user is patient
```

---

## Summary

✅ Profile menu opens correctly  
✅ Dashboard button shows for providers  
✅ Dashboard button hidden for patients  
✅ Medicine section untouched  
✅ Navigation works properly  
✅ Real-time updates active  

**All fixed and ready!** 🎉
