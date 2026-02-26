-- Add columns to track when doctor and patient join the video call
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS doctor_joined BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS patient_joined BOOLEAN DEFAULT false;

-- Fix ICE candidates columns to be TEXT arrays instead of TEXT
ALTER TABLE appointments
ALTER COLUMN ice_candidates_doctor TYPE TEXT[] USING CASE 
  WHEN ice_candidates_doctor IS NULL THEN ARRAY[]::TEXT[]
  ELSE ARRAY[ice_candidates_doctor]
END,
ALTER COLUMN ice_candidates_patient TYPE TEXT[] USING CASE 
  WHEN ice_candidates_patient IS NULL THEN ARRAY[]::TEXT[]
  ELSE ARRAY[ice_candidates_patient]
END;

-- Set defaults for ICE candidates
ALTER TABLE appointments
ALTER COLUMN ice_candidates_doctor SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN ice_candidates_patient SET DEFAULT ARRAY[]::TEXT[];

-- Create index for faster participant lookup
CREATE INDEX IF NOT EXISTS idx_appointments_participants ON appointments(doctor_joined, patient_joined);
