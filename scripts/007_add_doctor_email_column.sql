-- Add doctor_email column to appointments table for direct email matching
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS doctor_email VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_email ON appointments(doctor_email);

-- Update existing appointments with doctor emails from doctors table
UPDATE appointments a
SET doctor_email = d.email
FROM doctors d
WHERE a.doctor_id = d.id AND a.doctor_email IS NULL;

-- Show results
SELECT COUNT(*) as total_appointments, 
       COUNT(doctor_email) as appointments_with_email
FROM appointments;
