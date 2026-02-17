-- Add doctor_name column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_name TEXT;

-- Update existing appointments with doctor names from doctors table
UPDATE appointments 
SET doctor_name = doctors.name 
FROM doctors 
WHERE appointments.doctor_id = doctors.id 
AND appointments.doctor_name IS NULL;
