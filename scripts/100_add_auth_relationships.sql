-- Add auth relationships and RLS policies to all provider tables
-- This ensures only authenticated users can access their own data

-- 1. Add user_id column to all provider tables (if not exists)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE physiotherapists ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 2. Create indexes on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_user_id ON hospitals(user_id);
CREATE INDEX IF NOT EXISTS idx_labs_user_id ON labs(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_user_id ON pharmacies(user_id);
CREATE INDEX IF NOT EXISTS idx_ambulances_user_id ON ambulances(user_id);
CREATE INDEX IF NOT EXISTS idx_physiotherapists_user_id ON physiotherapists(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE physiotherapists ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies - Doctors can only see/edit their own profile
DROP POLICY IF EXISTS "Doctors can view their own profile" ON doctors;
CREATE POLICY "Doctors can view their own profile" ON doctors
  FOR SELECT USING (user_id = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;
CREATE POLICY "Doctors can update their own profile" ON doctors
  FOR UPDATE USING (user_id = (SELECT auth.uid()::text));

-- 5. Create RLS Policies - Hospitals can only see/edit their own profile
DROP POLICY IF EXISTS "Hospitals can view their own profile" ON hospitals;
CREATE POLICY "Hospitals can view their own profile" ON hospitals
  FOR SELECT USING (user_id = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Hospitals can update their own profile" ON hospitals;
CREATE POLICY "Hospitals can update their own profile" ON hospitals
  FOR UPDATE USING (user_id = (SELECT auth.uid()::text));

-- 6. Create RLS Policies - Labs can only see/edit their own profile
DROP POLICY IF EXISTS "Labs can view their own profile" ON labs;
CREATE POLICY "Labs can view their own profile" ON labs
  FOR SELECT USING (user_id = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Labs can update their own profile" ON labs;
CREATE POLICY "Labs can update their own profile" ON labs
  FOR UPDATE USING (user_id = (SELECT auth.uid()::text));

-- 7. Create RLS Policies - Pharmacies can only see/edit their own profile
DROP POLICY IF EXISTS "Pharmacies can view their own profile" ON pharmacies;
CREATE POLICY "Pharmacies can view their own profile" ON pharmacies
  FOR SELECT USING (user_id = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Pharmacies can update their own profile" ON pharmacies;
CREATE POLICY "Pharmacies can update their own profile" ON pharmacies
  FOR UPDATE USING (user_id = (SELECT auth.uid()::text));

-- 8. Create RLS Policies - Ambulances can only see/edit their own profile
DROP POLICY IF EXISTS "Ambulances can view their own profile" ON ambulances;
CREATE POLICY "Ambulances can view their own profile" ON ambulances
  FOR SELECT USING (user_id = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Ambulances can update their own profile" ON ambulances;
CREATE POLICY "Ambulances can update their own profile" ON ambulances
  FOR UPDATE USING (user_id = (SELECT auth.uid()::text));

-- 9. Create RLS Policies - Physiotherapists can only see/edit their own profile
DROP POLICY IF EXISTS "Physiotherapists can view their own profile" ON physiotherapists;
CREATE POLICY "Physiotherapists can view their own profile" ON physiotherapists
  FOR SELECT USING (user_id = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Physiotherapists can update their own profile" ON physiotherapists;
CREATE POLICY "Physiotherapists can update their own profile" ON physiotherapists
  FOR UPDATE USING (user_id = (SELECT auth.uid()::text));

-- 10. Allow public viewing of provider listings (but not edit/delete)
DROP POLICY IF EXISTS "Allow public to view doctors" ON doctors;
CREATE POLICY "Allow public to view doctors" ON doctors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public to view hospitals" ON hospitals;
CREATE POLICY "Allow public to view hospitals" ON hospitals
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public to view labs" ON labs;
CREATE POLICY "Allow public to view labs" ON labs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public to view pharmacies" ON pharmacies;
CREATE POLICY "Allow public to view pharmacies" ON pharmacies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public to view ambulances" ON ambulances;
CREATE POLICY "Allow public to view ambulances" ON ambulances
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public to view physiotherapists" ON physiotherapists;
CREATE POLICY "Allow public to view physiotherapists" ON physiotherapists
  FOR SELECT USING (true);
