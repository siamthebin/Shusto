-- Add meeting_time column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS meeting_time TIMESTAMP;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_meeting_time ON appointments(meeting_time);
