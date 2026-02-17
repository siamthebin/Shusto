## 🎯 Shusto Payment & Admin System - Complete Implementation Guide

### **1. PAYMENT GATEWAY (SSLCommerz) - HOW IT WORKS**

#### Flow Diagram:
```
User Adds Money in Wallet
    ↓
Frontend sends amount → /api/payment/sslcommerz/init
    ↓
Backend creates transaction (status: pending)
Backend generates Tran ID
    ↓
Response: SSLCommerz form parameters + URL
    ↓
Frontend auto-submits form to SSLCommerz (Sandbox/Production)
    ↓
User fills payment details in SSLCommerz checkout
    ↓
SSLCommerz processes payment
    ↓
SSLCommerz POST to /api/payment/sslcommerz/success
    ↓
Backend validates payment status
    ↓
If VALID:
  - Update transaction to "completed"
  - Update wallet balance (+amount)
  - Redirect to /payment/success?status=success
Else:
  - Redirect to /payment/success?status=failed
```

---

### **2. SETUP INSTRUCTIONS**

#### **Environment Variables Required:**
```
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production (or development)
```

#### **Sandbox vs Production:**
- **Sandbox**: For testing, doesn't require real payment
  - URL: `https://sandbox.sslcommerz.com`
  - Use test card details
  - Set `NODE_ENV=development`

- **Production**: Real payments
  - URL: `https://securepay.sslcommerz.com`
  - Real card processing
  - Set `NODE_ENV=production`

The code automatically switches based on `NODE_ENV`.

---

### **3. PAYMENT FLOW - TECHNICAL DETAILS**

**Step 1: Payment Initiation** (`/app/api/payment/sslcommerz/init/route.ts`)
- User clicks "Pay with SSLCommerz"
- Frontend POSTs amount to `/api/payment/sslcommerz/init`
- Backend validates user is authenticated
- Backend creates transaction record in `transactions` table:
  ```
  wallet_id: (user's wallet)
  type: "credit"
  amount: (payment amount)
  status: "pending"
  payment_method: "sslcommerz"
  reference_id: tranId (unique transaction ID)
  ```
- Returns SSLCommerz form parameters to frontend

**Step 2: Checkout** (Frontend)
- Frontend receives SSLCommerz URL and form params
- Auto-submits POST request to SSLCommerz endpoint
- User is redirected to SSLCommerz payment gateway
- User enters payment details

**Step 3: Payment Callback** (`/app/api/payment/sslcommerz/success/route.ts`)
- SSLCommerz sends response to success callback
- Backend validates payment status from SSLCommerz
- If status is "VALID" or "VALIDATED":
  - Update transaction status to "completed"
  - Get user's wallet from database
  - Update wallet balance: `wallet.balance += payment_amount`
  - Redirect to success page with details
- If payment failed: Redirect to failed page

**Step 4: Success Page** (`/app/payment/success/page.tsx`)
- Shows transaction ID, amount, timestamp
- Displays success/failed status
- Provides buttons to return home or continue shopping

---

### **4. DATABASE TABLES INVOLVED**

**`wallets` table:**
```
id: UUID (primary key)
user_id: UUID (foreign key to auth.users)
balance: DECIMAL (wallet balance in BDT)
currency: VARCHAR (default: "BDT")
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**`transactions` table:**
```
id: UUID (primary key)
wallet_id: UUID (foreign key to wallets)
type: VARCHAR ("credit" or "debit")
amount: DECIMAL
description: TEXT
payment_method: VARCHAR ("sslcommerz", "bkash", "nagad")
reference_id: VARCHAR (transaction/tran_id)
status: VARCHAR ("pending", "completed", "failed")
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

---

### **5. ADMIN DASHBOARD - PROVIDER MANAGEMENT**

#### Admin Features Already Implemented:

**1. Add Providers:**
- `/admin/add-pharmacy/page.tsx` → Add new pharmacies
- `/admin/add-hospital/page.tsx` → Add hospitals
- `/admin/add-lab/page.tsx` → Add diagnostic labs
- `/admin/add-physio/page.tsx` → Add physiotherapy centers
- `/admin/add-ambulance/page.tsx` → Add ambulance services
- `/admin/add-doctor/page.tsx` → Add doctors

**2. Manage Providers:**
- `/admin/pharmacies/page.tsx` → View all pharmacies
- `/admin/hospitals/page.tsx` → View all hospitals
- `/admin/labs/page.tsx` → View all labs
- `/admin/physios/page.tsx` → View all physio centers
- `/admin/ambulances/page.tsx` → View ambulances
- `/admin/manage-doctors/page.tsx` → Manage doctors
- `/admin/verify-doctors/page.tsx` → Verify doctors

**3. Business Analytics:**
- `/admin/earnings/page.tsx` → View earnings
- `/admin/revenue/page.tsx` → Revenue tracking
- `/admin/orders/page.tsx` → Order management

**4. Utilities:**
- `/admin/setup-database/page.tsx` → Database initialization
- `/admin/seed-medicines/page.tsx` → Add medicines to database

---

### **6. ADMIN ACCESS CONFIGURATION**

#### Current Setup:
- Admin email: `shustobd@gmail.com` (can be seen in `/app/api/payment/sslcommerz/init/route.ts`)
- Admin is prevented from adding money to wallet (provider accounts only)
- Admin has full access to all provider management pages

#### To Give Admin Dashboard Access:

**Option 1: Email-Based (Current)**
- Create user account with `shustobd@gmail.com`
- System automatically grants admin privileges

**Option 2: Role-Based (Recommended Enhancement)**
Create a new table:
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (REFERENCES auth.users),
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR (admin, moderator, manager),
  permissions TEXT[] (json array of permissions),
  created_at TIMESTAMP,
  created_by UUID
);
```

---

### **7. HOW TO USE - STEP BY STEP**

#### **For End Users:**
1. Sign up/Login to Shusto
2. Go to Wallet page
3. Click "Add Money" button
4. Select payment amount (৳100, ৳500, ৳1000, ৳2000, etc.)
5. Choose payment method: SSLCommerz, bKash, or Nagad
6. Click "Pay with [method]"
7. Complete payment details
8. See success/failure confirmation

#### **For Admin (shustobd@gmail.com):**
1. Login with admin credentials
2. Go to `/admin/` path (navigate via sidebar/menu)
3. Select provider type to manage:
   - **Pharmacies:** Click "Add Pharmacy" → Fill form → Submit
   - **Hospitals:** Click "Add Hospital" → Fill form → Submit
   - **Labs/Physio/etc:** Similar process
4. View all providers in respective list pages
5. Track business metrics in earnings/revenue pages

---

### **8. PAYMENT STATUSES & CODES**

**SSLCommerz Response Status Codes:**
- `VALID` / `VALIDATED` → Payment successful ✅
- `FAILED` → Payment failed ❌
- `CANCELLED` → User cancelled payment ❌
- `INVALID` → Invalid transaction ❌

**Transaction Status Values:**
- `pending` → Awaiting payment callback
- `completed` → Payment successful, balance updated
- `failed` → Payment failed
- `cancelled` → User cancelled

---

### **9. ERROR HANDLING**

**Common Issues & Solutions:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" error | User not logged in | Login first |
| "Minimum amount is 10" | Amount < 10 BDT | Increase amount |
| Payment stuck on callback | Network issue | Refresh page |
| Wallet not updating | Transaction failed | Check transaction status in DB |
| Admin can't add providers | Not admin account | Use shustobd@gmail.com account |

---

### **10. TESTING CHECKLIST**

- [ ] **Sandbox Payment Test**
  ```
  1. Set NODE_ENV=development
  2. Go to Wallet page
  3. Add ৳100
  4. Use SSLCommerz payment
  5. Use test card: 4111111111111111
  6. Verify wallet balance increases
  ```

- [ ] **Admin Provider Addition Test**
  ```
  1. Login as shustobd@gmail.com
  2. Go to /admin/add-pharmacy
  3. Fill form with test data
  4. Submit
  5. Verify pharmacy appears in /admin/pharmacies
  ```

- [ ] **Production Setup**
  ```
  1. Get live SSLCommerz credentials
  2. Update .env with production Store ID & Password
  3. Set NODE_ENV=production
  4. Test with real payment (₹1 or minimal amount)
  5. Monitor transactions in database
  ```

---

### **11. FILES REFERENCE**

**Payment Routes:**
- `/app/api/payment/sslcommerz/init/route.ts` ← Payment init
- `/app/api/payment/sslcommerz/success/route.ts` ← Callback handler
- `/app/api/payment/sslcommerz/fail/route.ts` ← Failure handler

**Admin Pages:**
- `/app/admin/add-*/page.tsx` ← Add provider pages
- `/app/admin/*/page.tsx` ← List provider pages

**Frontend Components:**
- `/components/kokonutui/cart-drawer.tsx` ← Wallet payment UI
- `/app/wallet/page.tsx` ← Wallet dashboard
- `/app/payment/success/page.tsx` ← Success page

**Database Setup:**
- `/scripts/004_setup_complete_database.sql` ← Full DB schema

---

### **12. NEXT STEPS FOR DEPLOYMENT**

1. **Get SSLCommerz Account**
   - Visit: https://sslcommerz.com
   - Create business account
   - Get Store ID and Password
   - Request production approval

2. **Update Environment Variables**
   ```
   SSLCOMMERZ_STORE_ID=your_production_id
   SSLCOMMERZ_STORE_PASSWORD=your_production_password
   NODE_ENV=production
   NEXT_PUBLIC_SITE_URL=https://shusto.com
   ```

3. **Deploy to Vercel**
   - Push changes to Git
   - Vercel auto-deploys
   - Verify payment flow works

4. **Monitor Payments**
   - Check `/admin/orders` for transaction history
   - Monitor wallet updates in Supabase
   - Set up error alerts

---

**Questions?** Check the code in the files referenced above or contact SSLCommerz support for payment-specific issues.
