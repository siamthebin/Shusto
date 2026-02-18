-- Add doctor_email column to appointments table for doctor notifications
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_email VARCHAR(255);

-- Update existing records to populate doctor_email from doctors table
UPDATE appointments a
SET doctor_email = d.email
FROM doctors d
WHERE a.doctor_id = d.id AND a.doctor_email IS NULL;
