-- Add doctor_email column to appointments table for direct matching
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS doctor_email TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_email_status 
ON appointments(doctor_email, status);

-- Update existing appointments to have doctor_email from doctors table
UPDATE appointments a
SET doctor_email = d.email
FROM doctors d
WHERE a.doctor_id = d.id
AND a.doctor_email IS NULL;
