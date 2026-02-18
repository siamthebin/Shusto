# Admin Setup Guide - Shusto

## shustobd@gmail.com কে Admin বানানোর পদ্ধতি

### Step 1: User Account তৈরি করুন
1. Shusto app এ যান: https://shusto.com
2. **Sign Up** button এ click করুন
3. Email: `shustobd@gmail.com` দিয়ে account তৈরি করুন
4. Email verification complete করুন

### Step 2: Admin Role Set করুন
1. **Supabase Dashboard** এ যান: https://supabase.com
2. আপনার Shusto project select করুন
3. Left sidebar থেকে **SQL Editor** এ যান
4. **New Query** click করুন
5. `scripts/set-shustobd-as-admin.sql` file এর সম্পূর্ণ code copy করুন
6. SQL Editor তে paste করুন
7. **Run** button এ click করুন

### Step 3: Verify Admin Access
1. Shusto app এ `shustobd@gmail.com` দিয়ে **logout** করুন (যদি login থাকেন)
2. আবার **login** করুন
3. Header এ **user icon** (👤) এ click করুন
4. Dropdown menu তে এখন তিনটা **Admin Option** দেখা যাবে:
   - ✅ **ডাক্তারদের তালিকা** (Doctors List)
   - ✅ **ডাক্তার যোগ করুন** (Add Doctor)
   - ✅ **ডাক্তার ম্যানেজ করুন** (Remove Doctor)

## Admin Features

### 1. ডাক্তারদের তালিকা (Doctors List)
- `/doctors` page এ যাবে
- সব registered doctors দেখতে পারবেন
- Doctor profiles view করতে পারবেন

### 2. ডাক্তার যোগ করুন (Add Doctor)
- `/admin/add-doctor` page এ যাবে
- Email invitation পাঠিয়ে নতুন doctor add করতে পারবেন
- Doctor এর details fill করতে পারবেন

### 3. ডাক্তার ম্যানেজ করুন (Remove Doctor)
- `/admin/manage-doctors` page এ যাবে
- সব doctors এর list দেখতে পারবেন
- Doctor account deactivate বা remove করতে পারবেন

## Important Notes

- শুধুমাত্র **shustobd@gmail.com** account এ admin options দেখা যাবে
- অন্য কোনো user এই admin features access করতে পারবে না
- Admin হিসেবে আপনি সব doctors কে manage করতে পারবেন
- Security এর জন্য এই email hardcoded করা আছে

## Troubleshooting

**Admin options দেখা যাচ্ছে না?**
1. Browser cache clear করুন (Ctrl+Shift+Del)
2. Hard refresh করুন (Ctrl+Shift+R)
3. Incognito mode এ try করুন
4. SQL script সঠিকভাবে run হয়েছে কিনা check করুন

**Console log check করুন:**
1. F12 press করে Developer Console খুলুন
2. দেখুন এই logs আসছে কিনা:
   - `[v0] User logged in: shustobd@gmail.com`
   - `[v0] Is admin? true`

যদি এই logs না আসে, তাহলে SQL script আবার run করুন।
