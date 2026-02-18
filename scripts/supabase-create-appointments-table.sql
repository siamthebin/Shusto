-- Create appointments table in Supabase
-- 
-- HOW TO RUN:
-- 1. Go to: https://supabase.com/dashboard/project/qrrshrkhgkkfkcfurrsv/sql
-- 2. Copy this entire SQL script
-- 3. Paste in the SQL Editor
-- 4. Click "Run" button
--
-- This will create the appointments table and insert a test appointment

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  symptoms TEXT,
  status VARCHAR(50) DEFAULT 'confirmed',
  payment_status VARCHAR(50) DEFAULT 'paid',
  video_room_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Insert test appointment for shustobd@gmail.com
INSERT INTO appointments (
  doctor_id, 
  patient_name, 
  patient_email, 
  patient_phone, 
  appointment_date, 
  appointment_time, 
  symptoms, 
  status, 
  payment_status, 
  video_room_id
) VALUES (
  1, 
  'ডাঃ এম আর সিরাজুল হক', 
  'shustobd@gmail.com', 
  '01712345678', 
  CURRENT_DATE + 2, 
  '14:00:00', 
  'জেনারেল চেকআপ', 
  'confirmed', 
  'paid', 
  'room_test_final'
);

-- Verify the appointment was created
SELECT * FROM appointments WHERE patient_email = 'shustobd@gmail.com';
