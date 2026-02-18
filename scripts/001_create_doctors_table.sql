-- Doctors table for Neon database (consistent with API routes)
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  bmdc_number VARCHAR(50),
  experience_years INTEGER DEFAULT 0,
  consultation_fee INTEGER DEFAULT 500,
  bio TEXT,
  photo_url TEXT,
  verification_status VARCHAR(50) DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_verification ON doctors(verification_status);

-- Insert sample doctors for testing
INSERT INTO doctors (name, email, specialty, bmdc_number, experience_years, consultation_fee, bio, verification_status)
VALUES 
  ('Dr. Sabbir Ahamed', 'sabbir@example.com', 'Health', '19', 6, 1000, 'Experienced health specialist', 'approved'),
  ('Dr. Mehar Nigar', 'mehar@example.com', 'Gynaecologist', '7928', 8, 500, 'Women health expert', 'approved')
ON CONFLICT (email) DO NOTHING;
