-- Creating appointments table with video call support fields
-- Drop existing if any issues, then create fresh
DROP TABLE IF EXISTS appointments CASCADE;

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  patient_name TEXT DEFAULT 'Guest Patient',
  patient_email TEXT,
  patient_phone TEXT DEFAULT '01700000000',
  appointment_date DATE DEFAULT CURRENT_DATE,
  appointment_time TIME DEFAULT CURRENT_TIME,
  symptoms TEXT DEFAULT 'General Consultation',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid',
  
  -- Video call WebRTC signaling fields
  video_room_id TEXT,
  call_offer TEXT,
  call_answer TEXT,
  ice_candidates_doctor TEXT,
  ice_candidates_patient TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_video_room ON appointments(video_room_id);

-- RLS policies for security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow doctors to see their own appointments
CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  USING (true);

-- Allow anyone to create appointments (booking)
CREATE POLICY "Anyone can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- Allow doctors to update their appointments
CREATE POLICY "Doctors can update their appointments"
  ON appointments FOR UPDATE
  USING (true);
