-- Video call signaling table
CREATE TABLE IF NOT EXISTS video_call_rooms (
  id TEXT PRIMARY KEY,
  doctor_joined BOOLEAN DEFAULT FALSE,
  patient_joined BOOLEAN DEFAULT FALSE,
  offer JSONB,
  answer JSONB,
  doctor_candidates JSONB DEFAULT '[]'::jsonb,
  patient_candidates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_video_call_rooms_created_at ON video_call_rooms(created_at);
