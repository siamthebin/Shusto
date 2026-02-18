-- Add doctor_email column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_email TEXT;

-- Update existing appointments with doctor email from doctors table
UPDATE appointments 
SET doctor_email = doctors.email 
FROM doctors 
WHERE appointments.doctor_id = doctors.id 
AND appointments.doctor_email IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_email ON appointments(doctor_email);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
