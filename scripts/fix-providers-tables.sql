-- Create hospitals table (if not exists)
CREATE TABLE IF NOT EXISTS hospitals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  emergency_number VARCHAR(50),
  specialties TEXT,
  bed_count INTEGER DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ambulances table (if not exists)
CREATE TABLE IF NOT EXISTS ambulances (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  vehicle_number VARCHAR(100),
  type VARCHAR(50) DEFAULT 'basic',
  driver_name VARCHAR(255),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create physiotherapists table (if not exists)
CREATE TABLE IF NOT EXISTS physiotherapists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  specialization VARCHAR(100),
  experience_years INTEGER DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create labs table (if not exists)
CREATE TABLE IF NOT EXISTS labs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  license_number VARCHAR(100),
  owner_name VARCHAR(255),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing tables (safe - won't error if already exist)
DO $$ BEGIN
  ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false;
  ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
  ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
  ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false;
  ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
  ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
  ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add order_type and assigned provider columns to orders table
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'medicine';
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_lab_id INTEGER;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_lab_name VARCHAR(255);
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_physio_id INTEGER;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_physio_name VARCHAR(255);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
