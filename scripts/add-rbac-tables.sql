-- Create provider_roles table for RBAC system
CREATE TABLE IF NOT EXISTS provider_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_type VARCHAR(50) NOT NULL, -- 'doctor', 'pharmacy', 'lab', 'hospital', 'ambulance', 'physio'
  provider_id UUID NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'owner', 'editor', 'manager', 'viewer'
  granted_by VARCHAR(255),
  granted_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(provider_type, provider_id, user_email),
  CREATED_AT TIMESTAMP DEFAULT NOW(),
  UPDATED_AT TIMESTAMP DEFAULT NOW()
);

-- Add owner_email column to all provider tables
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
ALTER TABLE labs ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
ALTER TABLE ambulance ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
ALTER TABLE physio ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_provider_roles_email ON provider_roles(user_email);
CREATE INDEX IF NOT EXISTS idx_provider_roles_provider ON provider_roles(provider_type, provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_roles_active ON provider_roles(is_active);

-- Add RLS (Row Level Security) to provider_roles table
ALTER TABLE provider_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for provider_roles
CREATE POLICY "Users can view their own roles" ON provider_roles
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can manage all roles" ON provider_roles
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Add paused column if it doesn't exist
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS paused BOOLEAN DEFAULT false;
ALTER TABLE pharmacies ADD COLUMN IF NOT EXISTS paused BOOLEAN DEFAULT false;
ALTER TABLE labs ADD COLUMN IF NOT EXISTS paused BOOLEAN DEFAULT false;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS paused BOOLEAN DEFAULT false;
ALTER TABLE ambulance ADD COLUMN IF NOT EXISTS paused BOOLEAN DEFAULT false;
ALTER TABLE physio ADD COLUMN IF NOT EXISTS paused BOOLEAN DEFAULT false;
