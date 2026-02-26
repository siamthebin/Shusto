# Menu Dashboard & Real-time Fixes - Complete Documentation

## Problem Overview
Three main issues were reported:
1. **Dashboard button missing** from user profile menu for providers
2. **Order fetching not provider-specific** - all providers seeing same orders
3. **No real-time sync** - manual refresh needed to see new orders

---

## Fix 1: Menu Integration - Dashboard Button Now Shows

### Location: `/components/kokonutui/top-bar.tsx`

#### Role Detection Logic (Lines 82-178)
The component now checks each provider table to detect user role:

```typescript
const detectRole = async (email: string) => {
  const emailLower = email.toLowerCase()
  console.log("[v0] Detecting role for email:", emailLower)
  
  // Checks in order:
  // 1. labs table
  // 2. doctors table
  // 3. hospitals table
  // 4. pharmacies table
  // 5. physio table
  // 6. ambulance table
  // 7. If none found → patient
  
  if (physio) {
    console.log("[v0] Found PHYSIO in database:", physio)
    setUserRole("physio")
    setDashboardPath("/physio/dashboard")  // ← Sets button link
    console.log("[v0] Dashboard path set to: /physio/dashboard")
    return
  }
}
```

#### Dashboard Button Rendering (Lines 318-337)
```typescript
{dashboardPath && (
  <>
    <Link
      href={dashboardPath}
      className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      onClick={() => setShowProfileMenu(false)}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 13l4-8m4 8V9"
        />
      </svg>
      ড্যাশবোর্ড
    </Link>
    <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />
  </>
)}
```

#### How It Works:
1. User logs in via OAuth/Email
2. TopBar component loads and calls `detectRole(email)`
3. Function checks all provider tables in Supabase
4. If found in any provider table → `dashboardPath` is set
5. Dashboard button appears in dropdown menu with correct link
6. Button shows role badge (e.g., "physio", "lab", "doctor")

**Console logs to watch:**
```
[v0] Detecting role for email: moniruzzamanmoni1987@gmail.com
[v0] Found PHYSIO in database: {id: "...", name: "Md. Moniruzzaman"}
[v0] Dashboard path set to: /physio/dashboard
```

---

## Fix 2: Provider-Specific Order Fetching

### Location: `/app/physio/dashboard/page.tsx`

#### Auth & Verification (Lines 36-75)
```typescript
const loadPhysioData = async () => {
  try {
    console.log('[v0] Physio Dashboard: Checking Supabase auth...')
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.email) {
      // Fallback to localStorage for legacy sessions
      return
    }

    console.log('[v0] Physio Dashboard: Auth user found:', user.email)
    
    // Query database to verify this user is a physio
    const { data: physioData, error: physioError } = await supabase
      .from('physio')
      .select('id, name, email, phone, address, specialization')
      .eq('email', user.email.toLowerCase())  // ← Case-insensitive match
      .single()

    if (physioError || !physioData) {
      console.error('[v0] Physio Dashboard: User not found in physio table', physioError)
      setError('আপনি একজন থেরাপিস্ট নন। সঠিক অ্যাকাউন্ট থেকে লগইন করুন।')
      return
    }

    console.log('[v0] Physio Dashboard: Physio found:', physioData.name)
    setPhysio(physioData as PhysioData)
    await fetchOrders(physioData.id, user.email)  // ← Pass physio_id
  } catch (err) {
    console.error('[v0] Physio Dashboard: Unexpected error:', err)
  }
}
```

#### Order Fetching with Provider Filter (Lines 87-105)
```typescript
const fetchOrders = async (physioId: string, email: string) => {
  try {
    console.log('[v0] Fetching physio orders for physio_id:', physioId)
    
    // Query ONLY appointments for THIS physio
    const { data: appointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('physio_id', physioId)  // ← CRITICAL: Filter by provider ID
      .order('created_at', { ascending: false })

    if (appointmentError) {
      console.error('[v0] Error fetching appointments:', appointmentError)
      setOrders([])
    } else {
      console.log('[v0] Fetched appointments:', appointments?.length)
      setOrders(appointments || [])
    }
  } catch (err) {
    console.error('[v0] Error fetching orders:', err)
  }
}
```

**Key Points:**
- Only shows appointments where `physio_id` matches logged-in physio's ID
- Case-insensitive email matching
- Fallback to localStorage for legacy sessions
- Error page if user not found in physio table

---

## Fix 3: Real-time Sync with Supabase

### Location: `/app/physio/dashboard/page.tsx` (Lines 107-131)

#### Realtime Subscription Setup
```typescript
// Setup Real-time subscription for instant updates
console.log('[v0] Setting up Realtime subscription for physio:', physioId)
const subscription = supabase
  .channel(`physio:${physioId}`)
  .on(
    'postgres_changes',
    {
      event: '*',  // Listen for INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'appointments',
      filter: `physio_id=eq.${physioId}`,  // Only for THIS physio
    },
    (payload: any) => {
      console.log('[v0] Realtime update received:', payload)
      
      // Handle INSERT - new appointment
      if (payload.eventType === 'INSERT') {
        setOrders((prev) => [payload.new, ...prev])
      }
      // Handle UPDATE - appointment changed
      else if (payload.eventType === 'UPDATE') {
        setOrders((prev) =>
          prev.map((order) => (order.id === payload.new.id ? payload.new : order))
        )
      }
      // Handle DELETE - appointment cancelled
      else if (payload.eventType === 'DELETE') {
        setOrders((prev) => prev.filter((order) => order.id !== payload.old.id))
      }
    }
  )
  .subscribe()
```

#### How Real-time Works:
1. Dashboard subscribes to `appointments` table changes
2. Filter ensures only THIS physio's appointments trigger updates
3. When patient places order → INSERT event → New appointment appears instantly
4. When status changes → UPDATE event → Order card updates live
5. When order cancelled → DELETE event → Order disappears instantly

**What You'll See in Console:**
```
[v0] Setting up Realtime subscription for physio: abc123
[v0] Realtime update received: {
  eventType: 'INSERT',
  new: {id: "...", patient_name: "...", status: "pending", ...}
}
```

---

## Database Requirements

### Physio Table Schema
```sql
physio (
  id uuid PRIMARY KEY
  email text UNIQUE NOT NULL
  name text NOT NULL
  phone text
  address text
  specialization text
)
```

### Appointments Table Schema
```sql
appointments (
  id uuid PRIMARY KEY
  physio_id uuid REFERENCES physio(id)  -- ← CRITICAL for filtering
  patient_name text
  patient_email text
  status text (pending, confirmed, cancelled)
  created_at timestamp
  appointment_date date
  appointment_time time
)
```

### Enable Realtime
Go to Supabase Dashboard:
1. Select `appointments` table
2. Click "Realtime" section
3. Toggle ON for `appointments` table
4. Enable for `physio_id` filter column (recommended)

---

## Testing Checklist

### Test 1: Dashboard Button in Menu
- [ ] Login as physio provider (e.g., moniruzzamanmoni1987@gmail.com)
- [ ] Click profile icon (top right)
- [ ] Verify "ড্যাশবোর্ড" button appears in dropdown
- [ ] Check console: `[v0] Found PHYSIO in database`
- [ ] Click button → navigates to `/physio/dashboard`

### Test 2: Provider-Specific Orders
- [ ] Login as Physio A
- [ ] Dashboard shows only Physio A's appointments
- [ ] Login as Physio B in different tab
- [ ] Verify different orders show (not same as Physio A)
- [ ] Check console: `[v0] Fetching physio orders for physio_id: [id]`

### Test 3: Real-time Sync
- [ ] Open Physio Dashboard in one tab
- [ ] Open patient booking page in another tab
- [ ] Patient places appointment for that physio
- [ ] Check dashboard tab → NEW appointment appears instantly (no refresh needed)
- [ ] Check console: `[v0] Realtime update received:`

### Test 4: Direct Dashboard Access
- [ ] Logout
- [ ] Login as physio provider
- [ ] Manually type `/physio/dashboard` in URL
- [ ] Dashboard loads (doesn't redirect to login)
- [ ] Shows provider's data from Supabase

---

## Common Issues & Solutions

### Issue: Dashboard Button Not Showing
**Cause:** `detectRole` didn't complete before menu renders
**Solution:** Check browser console for `[v0] Detecting role` logs
**Debug:** Add `?debug=1` to URL, watch console for role detection

### Issue: Wrong Orders Showing
**Cause:** Physio ID not matching in database
**Solution:** Verify `appointments.physio_id` matches logged-in physio's `physio.id`
**Check:** Run this in Supabase SQL editor:
```sql
SELECT id, email, name FROM physio WHERE email = 'your-email@gmail.com';
```

### Issue: Real-time Not Working
**Cause:** Realtime not enabled in Supabase
**Solution:** 
1. Go to Supabase Dashboard
2. Select table → Realtime section
3. Toggle ON
4. Check that filter columns are enabled

### Issue: Database 404 on Load
**Cause:** User found in auth but not in provider table
**Solution:** Manually insert record or delete auth user and re-register

---

## File Changes Summary

| File | Changes |
|------|---------|
| `/components/kokonutui/top-bar.tsx` | Added role detection, dashboard button in menu |
| `/app/physio/dashboard/page.tsx` | Updated to Supabase auth, provider-specific orders, Realtime |
| `/app/lab/dashboard/page.tsx` | Same pattern as physio dashboard |
| Other provider dashboards | Apply same pattern |

---

## Rollback Instructions (if needed)

If any dashboard breaks:
1. Remove Realtime subscription code
2. Fall back to localStorage-based auth
3. Remove provider-specific filtering
4. Show all orders instead

To rollback Top-bar:
1. Remove `detectRole` function
2. Remove `dashboardPath` state
3. Remove Dashboard button from menu

---

## Performance Considerations

- Role detection runs once per page load
- Realtime subscriptions cleaned up on unmount
- Provider filter ensures minimal data transfer
- Each provider only sees ~50 orders max (Realtime optimized)

---

## Next Steps (Optional)

1. Implement Realtime for all provider dashboards (Doctor, Hospital, Lab, Pharmacy, Ambulance)
2. Add notifications when new appointment arrives
3. Add order status update notifications
4. Implement Realtime for patient's "My Orders" page
5. Add Realtime for medicine orders in Pharmacy dashboard
