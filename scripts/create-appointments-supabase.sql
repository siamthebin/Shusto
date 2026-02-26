-- Create appointments table in Supabase
CREATE TABLE IF NOT EXISTS public.appointments (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  symptoms TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  video_room_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON public.appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

-- Insert a test appointment
INSERT INTO public.appointments (
  doctor_id, 
  patient_name, 
  patient_email, 
  patient_phone, 
  appointment_date, 
  appointment_time, 
  symptoms, 
  status, 
  payment_status, 
  video_room_id
) VALUES (
  1, 
  'ডাঃ এম আর সিরাজুল হক', 
  'shustobd@gmail.com', 
  '01712345678', 
  CURRENT_DATE + 2, 
  '14:00:00', 
  'জেনারেল চেকআপ', 
  'confirmed', 
  'paid', 
  'room_test_working'
);
