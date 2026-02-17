-- Create pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  license_number TEXT,
  owner_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create labs table
CREATE TABLE IF NOT EXISTS labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  license_number TEXT,
  owner_name TEXT,
  services TEXT[],
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster email lookups
CREATE INDEX IF NOT EXISTS idx_pharmacies_email ON pharmacies(email);
CREATE INDEX IF NOT EXISTS idx_labs_email ON labs(email);

-- Enable RLS
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Admins can insert pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Admins can update pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Admins can delete pharmacies" ON pharmacies;

DROP POLICY IF EXISTS "Anyone can view labs" ON labs;
DROP POLICY IF EXISTS "Admins can insert labs" ON labs;
DROP POLICY IF EXISTS "Admins can update labs" ON labs;
DROP POLICY IF EXISTS "Admins can delete labs" ON labs;

-- RLS policies for pharmacies
CREATE POLICY "Anyone can view pharmacies" ON pharmacies FOR SELECT USING (true);
CREATE POLICY "Admins can insert pharmacies" ON pharmacies FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update pharmacies" ON pharmacies FOR UPDATE USING (true);
CREATE POLICY "Admins can delete pharmacies" ON pharmacies FOR DELETE USING (true);

-- RLS policies for labs
CREATE POLICY "Anyone can view labs" ON labs FOR SELECT USING (true);
CREATE POLICY "Admins can insert labs" ON labs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update labs" ON labs FOR UPDATE USING (true);
CREATE POLICY "Admins can delete labs" ON labs FOR DELETE USING (true);
