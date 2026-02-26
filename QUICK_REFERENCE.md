# Quick Reference Card

## 3 Fixes Implemented

### 1️⃣ Dashboard Button in Menu
**Location:** `/components/kokonutui/top-bar.tsx` (Lines 318-337)
```typescript
{dashboardPath && (
  <Link href={dashboardPath}>
    <svg>...</svg>
    ড্যাশবোর্ড
  </Link>
)}
```
**Trigger:** Role detection finds provider in database → `dashboardPath` set → Button appears

---

### 2️⃣ Provider-Specific Orders
**Location:** `/app/physio/dashboard/page.tsx` (Lines 87-105)
```typescript
const { data: appointments } = await supabase
  .from('appointments')
  .select('*')
  .eq('physio_id', physioId)  // ← THE KEY LINE
```
**Result:** Each provider sees ONLY their orders

---

### 3️⃣ Real-time Sync
**Location:** `/app/physio/dashboard/page.tsx` (Lines 107-131)
```typescript
supabase
  .channel(`physio:${physioId}`)
  .on('postgres_changes', {
    table: 'appointments',
    filter: `physio_id=eq.${physioId}`,
  }, (payload) => {
    if (payload.eventType === 'INSERT') {
      setOrders((prev) => [payload.new, ...prev])
    }
  })
  .subscribe()
```
**Result:** Orders appear instantly without refresh

---

## Test These Three Things

| Test | Expected | Check |
|------|----------|-------|
| **1. Menu Button** | "ড্যাশবোর্ড" appears in profile dropdown | Green button visible |
| **2. Provider Orders** | See only your appointments | Click dashboard → shows your orders |
| **3. Real-time** | New order appears instantly | Place order, don't refresh → appears |

---

## Debug Console Logs

```javascript
// Good logs = Everything working
[v0] Found PHYSIO in database
[v0] Dashboard path set to: /physio/dashboard
[v0] Fetching physio orders for physio_id: ...
[v0] Realtime update received

// Bad logs = Something wrong
[v0] No provider role found - user is a patient
[v0] User not found in physio table
[v0] Realtime update NOT received
```

---

## Key Files Changed

| File | What |
|------|------|
| `/components/kokonutui/top-bar.tsx` | Role detection + Dashboard button |
| `/app/physio/dashboard/page.tsx` | Supabase auth + Provider filter + Realtime |

---

## Supabase Setup Required

```
✅ appointments table has "physio_id" column
✅ physio_id is Foreign Key to physio.id
✅ Realtime enabled on "appointments" table
```

---

## One-Minute Test

1. Login as provider
2. Click profile icon
3. See "ড্যাশবোর্ড"? ✅ Fix 1 working
4. Click it → See your orders only? ✅ Fix 2 working
5. Patient books → Order appears instantly? ✅ Fix 3 working

---

## If Broken

| Issue | Fix |
|-------|-----|
| Button not showing | Clear cache (Ctrl+Shift+Del), refresh |
| Wrong orders | Check database: `physio_id = ?` |
| No real-time | Enable Realtime in Supabase |

---

## Documentation Files

| File | Read For |
|------|----------|
| `/IMPLEMENTATION_COMPLETE.md` | Full technical details |
| `/MENU_DASHBOARD_REALTIME_FIXES.md` | Detailed explanations |
| `/VERIFY_FIXES.md` | Step-by-step testing |
| `/QUICK_REFERENCE.md` | This file - ultra quick |

---

Done! All 3 fixes ready to test. 🎉
