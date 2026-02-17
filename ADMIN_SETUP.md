# Shusto Admin Setup Guide

## কে Admin হবে?

**আপনি (Shusto এর মালিক)** প্রথম admin হবেন।

## কিভাবে Admin বানাবেন:

### পদ্ধতি ১: Supabase Dashboard থেকে (সহজ)

1. **Supabase Dashboard এ যান:** https://supabase.com/dashboard
2. **আপনার project select করুন**
3. **SQL Editor তে যান** (বাম sidebar থেকে)
4. **এই SQL command run করুন:**

\`\`\`sql
-- আপনার email দিয়ে admin বানান
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);
\`\`\`

**Important:** `your-email@example.com` এর জায়গায় আপনার actual email দিন যেটা signup করার সময় ব্যবহার করেছেন।

### পদ্ধতি ২: SQL Script দিয়ে

1. নিচের script তৈরি করুন এবং run করুন:

\`\`\`sql
-- প্রথম admin তৈরি করুন (এটি একবার run করুন)
INSERT INTO user_profiles (id, role, full_name, phone)
SELECT id, 'admin', 'Shusto Admin', '+8801XXXXXXXXX'
FROM auth.users
WHERE email = 'admin@shusto.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
\`\`\`

## Admin হওয়ার পরে কি করবেন:

### ১. Doctor Verification করুন

1. **Login করুন** admin হিসেবে
2. **Header এ "প্ল্যাটফর্ম আয়" button দেখতে পাবেন**
3. **Admin menu খুলুন**
4. **Doctor Verification page এ যান:** `/admin/verify-doctors`

এখানে আপনি দেখতে পাবেন:
- সব pending doctor applications
- BMDC number
- Qualification
- Experience
- Bio

### ২. Doctor Approve/Reject করুন

**Approve করার জন্য:**
- Doctor এর তথ্য review করুন
- BMDC number verify করুন (Bangladesh Medical & Dental Council website এ check করুন)
- "অনুমোদন করুন" button click করুন

**Reject করার জন্য:**
- প্রত্যাখ্যানের কারণ লিখুন (যেমন: "BMDC number verify করা যায়নি")
- "প্রত্যাখ্যান করুন" button click করুন

### ৩. Admin Panel Features

Admin হিসেবে access পাবেন:

- `/admin/verify-doctors` - Doctor applications verify
- `/admin/earnings` - Platform earnings দেখুন
- `/admin/orders` - সব medicine orders monitor করুন
- `/admin/seed-medicines` - Database এ medicines add করুন

## কিভাবে অন্য কাউকে Admin বানাবেন:

যদি আরেকজন admin প্রয়োজন হয়:

\`\`\`sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'new-admin@example.com'
);
\`\`\`

## Security Tips:

1. Admin email সবসময় secret রাখুন
2. Strong password ব্যবহার করুন
3. শুধুমাত্র trusted persons কে admin বানান
4. Regular basis এ doctor verifications check করুন

## Common Questions:

**Q: আমি কি doctor ও admin একসাথে হতে পারি?**
A: না। একজন user শুধু একটা role রাখতে পারে: `patient`, `doctor`, অথবা `admin`।

**Q: Doctor verification কতক্ষণ লাগবে?**
A: আপনি manual review করবেন, তাই এটা আপনার উপর নির্ভর করে। তবে ২৪-৪৮ ঘণ্টার মধ্যে করা ভালো।

**Q: BMDC number কিভাবে verify করব?**
A: Bangladesh Medical & Dental Council এর official website এ গিয়ে doctor registration search করুন।

## সাহায্য প্রয়োজন?

যদি কোনো সমস্যা হয়, তাহলে Supabase Dashboard এর SQL Editor থেকে এই query run করুন current admin দেখার জন্য:

\`\`\`sql
SELECT 
  u.email,
  up.role,
  up.full_name
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE up.role = 'admin';
