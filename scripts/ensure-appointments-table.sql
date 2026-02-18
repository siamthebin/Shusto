-- Create appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  symptoms TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  video_room_id VARCHAR(255),
  call_offer TEXT,
  call_answer TEXT,
  ice_candidates_doctor TEXT[],
  ice_candidates_patient TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster patient email lookups
CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON appointments(patient_email);

-- Create index for faster doctor lookups  
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Show all appointments to verify
SELECT id, patient_name, patient_email, doctor_id, appointment_date, status, created_at 
FROM appointments 
ORDER BY created_at DESC 
LIMIT 10;
