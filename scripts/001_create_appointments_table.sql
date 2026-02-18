-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  consultation_fee REAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  meeting_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert appointments (patients booking)
CREATE POLICY "allow_insert_appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view appointments (doctor and patient)
CREATE POLICY "allow_select_appointments"
  ON public.appointments
  FOR SELECT
  USING (true);

-- Allow anyone to update appointments (doctor approving)
CREATE POLICY "allow_update_appointments"
  ON public.appointments
  FOR UPDATE
  USING (true);

-- Create index for faster doctor queries
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_name ON public.appointments(doctor_name);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON public.appointments(patient_email);
