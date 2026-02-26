-- Add doctor_email column to appointments table if not exists
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_email TEXT;

-- Update ALL existing appointments with doctor email from doctors table
UPDATE appointments 
SET doctor_email = doctors.email 
FROM doctors 
WHERE appointments.doctor_id = doctors.id;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_email ON appointments(doctor_email);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
