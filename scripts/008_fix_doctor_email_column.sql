-- Add doctor_email column to appointments table for direct matching
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_email TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_email ON appointments(doctor_email);

-- Update existing appointments to have doctor_email from doctors table
UPDATE appointments
SET doctor_email = doctors.email
FROM doctors
WHERE appointments.doctor_id = doctors.id
AND appointments.doctor_email IS NULL;
