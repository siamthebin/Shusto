-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_phone TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  label TEXT DEFAULT 'home',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS policies for user_addresses
CREATE POLICY "Users can view their own addresses" ON user_addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" ON user_addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Create pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  license_number TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create labs table
CREATE TABLE IF NOT EXISTS labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  license_number TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  services TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for pharmacies and labs
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read pharmacies and labs
CREATE POLICY "Anyone can view pharmacies" ON pharmacies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view labs" ON labs FOR SELECT TO authenticated USING (true);

-- Allow admins to manage pharmacies and labs (using service role)
CREATE POLICY "Service role can manage pharmacies" ON pharmacies FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage labs" ON labs FOR ALL TO service_role USING (true);
