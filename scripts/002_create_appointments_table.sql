-- Appointments table for Neon database (consistent with API routes)
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(50) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  symptoms TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  payment_method VARCHAR(100),
  transaction_id VARCHAR(255),
  video_room_id VARCHAR(255),
  call_status VARCHAR(50) DEFAULT 'not_started',
  call_offer TEXT,
  call_answer TEXT,
  ice_candidates_doctor TEXT,
  ice_candidates_patient TEXT,
  call_started_at TIMESTAMP,
  call_ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_video_room ON appointments(video_room_id);

-- Add foreign key constraint
ALTER TABLE appointments 
ADD CONSTRAINT fk_doctor 
FOREIGN KEY (doctor_id) REFERENCES doctors(id) 
ON DELETE CASCADE;
