# Shusto - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Clone and Install
```bash
git clone your-repo
cd shusto
npm install
```

### 2. Setup Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Add Your Supabase Details
Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```
Visit http://localhost:3000

---

## 🔐 Test Credentials (Sandbox)

### SSLCommerz Payment
- **Store ID**: `shust6992a1e590b0e`
- **Password**: `6e7a0efbf62b1d6e27e29dd77d73`
- **Mode**: Sandbox (testing)

### Test Cards
- Card: `4111111111111111`
- CVV: `123`
- Expiry: `12/25`

---

## 📋 Main Features

### 1. Role-Based Dashboards
```
Email in doctors table → /doctor/dashboard
Email in hospitals table → /hospital/dashboard
Email in labs table → /lab/dashboard
Email in pharmacies table → /pharmacy/dashboard
Email in physio table → /physio/dashboard
Email in ambulance table → /ambulance/dashboard
Other email → /dashboard (patient)
```

### 2. Medicine Pricing
- Uses `price_tag` column from medicines table
- Displays in ৳ (Taka) format
- Shows in cart and checkout

### 3. Payments
- SSLCommerz Sandbox integrated
- Supports: Wallet topup, Medicine orders, Appointment bookings
- Success/Fail callbacks configured

### 4. Notifications
- Browser notifications with sound
- Plays on: New bookings, Orders, Payments
- Auto-dismiss after 10 seconds

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `/lib/role-detection.ts` | Detect user role |
| `/lib/notifications.ts` | Show notifications with sound |
| `/lib/payment-helper.ts` | Payment initialization |
| `/app/api/detect-role/route.ts` | Role detection API |
| `/app/medicines/page.tsx` | Medicine store (with pricing fix) |
| `/components/booking-modal.tsx` | Booking with notifications |
| `/DEPLOYMENT_GUIDE.md` | Deploy to Vercel |

---

## 🧪 Testing

### Test Login with Different Roles
1. **Doctor Account** → Auto-redirects to `/doctor/dashboard`
2. **Hospital Account** → Auto-redirects to `/hospital/dashboard`
3. **Patient Account** → Auto-redirects to `/dashboard`

### Test Payments (Sandbox)
1. Go to Wallet page
2. Click "Add Balance"
3. Enter amount (min 10 BDT)
4. Use test card: `4111111111111111`
5. Should see success notification with sound

### Test Notifications
1. Create a booking
2. Should hear loud alarm sound
3. See browser notification
4. Mobile: Should vibrate

---

## 🐛 Common Issues

### "Cannot find module" Error
```bash
npm install
npm run dev
```

### Environment variables not loading
- Check `.env.local` exists
- Restart dev server: `Ctrl+C`, then `npm run dev`
- No spaces around `=` in env file

### Supabase connection error
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure Supabase project is active

### Notifications not working
- Check browser notification permissions (browser settings)
- Allow notifications when prompted
- Check browser console for errors

---

## 📦 Deploy to Vercel

```bash
# Install CLI
npm install -g vercel

# Connect account
vercel login

# Link project
vercel link

# Add environment variables
vercel env add

# Deploy
vercel --prod

# View logs
vercel logs --prod
```

More details in `/DEPLOYMENT_GUIDE.md`

---

## 📱 Add Environment Variables to Vercel

In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SSLCOMMERZ_STORE_ID
SSLCOMMERZ_STORE_PASSWORD
NEXT_PUBLIC_SITE_URL
```

---

## 💻 Development Tips

### Local Testing with SSL
```bash
# For testing OAuth locally
# Add to /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 localhost.test
```

### Database Testing
```sql
-- Check if user is a doctor
SELECT * FROM doctors WHERE email = 'user@email.com';

-- Check medicine prices
SELECT "brand name", price_tag FROM medicine LIMIT 5;
```

### Debug Logs
Open browser DevTools (F12) → Console to see:
```
[v0] Role detection...
[v0] Payment initialization...
[v0] Booking created...
```

---

## 🎯 Checklist Before Launch

- [ ] All env variables set
- [ ] Test login with all user types
- [ ] Test medicine ordering
- [ ] Test payment (sandbox)
- [ ] Test notifications
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Deployment guide followed
- [ ] Custom domain configured

---

## 📞 Help & Support

1. **Errors?** Check browser console (F12)
2. **Database issues?** Check Supabase dashboard
3. **Payment issues?** Check SSLCommerz sandbox logs
4. **Deployment stuck?** Check `/DEPLOYMENT_GUIDE.md`

---

**Ready to go! 🎉**

Run `npm run dev` and start building!
