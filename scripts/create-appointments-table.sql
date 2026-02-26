-- Create appointments table for patient-doctor booking system
-- Using TEXT for IDs to ensure compatibility with both integer and UUIDs
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_name TEXT NOT NULL DEFAULT 'N/A',
  patient_email TEXT,
  patient_phone TEXT,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL, 
  appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  appointment_time TIME NOT NULL DEFAULT CURRENT_TIME,
  symptoms TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  video_room_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster doctor queries
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert appointments (for booking)
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
CREATE POLICY "Anyone can create appointments" ON appointments
  FOR INSERT WITH CHECK (true);

-- Policy: Anyone can view appointments
DROP POLICY IF EXISTS "Anyone can view appointments" ON appointments;
CREATE POLICY "Anyone can view appointments" ON appointments
  FOR SELECT USING (true);

-- Policy: Anyone can update appointments
DROP POLICY IF EXISTS "Anyone can update appointments" ON appointments;
CREATE POLICY "Anyone can update appointments" ON appointments
  FOR UPDATE USING (true);
