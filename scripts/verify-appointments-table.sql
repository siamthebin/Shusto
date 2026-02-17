-- Check if appointments table exists and recreate if needed
DROP TABLE IF EXISTS appointments CASCADE;

CREATE TABLE appointments (
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

-- Disable RLS to allow all operations
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Create index for faster email lookups
CREATE INDEX idx_appointments_patient_email ON appointments(patient_email);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Insert a test record to verify table works
INSERT INTO appointments (
  doctor_id,
  patient_name,
  patient_email,
  patient_phone,
  appointment_date,
  appointment_time,
  symptoms,
  video_room_id
) VALUES (
  1,
  'Test Patient',
  'test@example.com',
  '01700000000',
  CURRENT_DATE,
  '10:00:00',
  'Test appointment',
  'room_test_12345'
);

-- Show the result
SELECT * FROM appointments;
