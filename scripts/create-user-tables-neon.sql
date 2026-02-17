-- Fixed SQL for Neon (not Supabase)
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  role TEXT DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_addresses table  
CREATE TABLE IF NOT EXISTS user_addresses (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  user_phone TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  label TEXT DEFAULT 'home',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id SERIAL PRIMARY KEY,
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
  id SERIAL PRIMARY KEY,
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_phone ON user_addresses(user_phone);
CREATE INDEX IF NOT EXISTS idx_pharmacies_email ON pharmacies(email);
CREATE INDEX IF NOT EXISTS idx_labs_email ON labs(email);
