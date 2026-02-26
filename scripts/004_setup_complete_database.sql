-- Complete database setup for Shusto telemedicine app
-- Run this script to create all tables and seed data

-- Drop existing tables if needed (be careful in production!)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;

-- Create doctors table
CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  bmdc_number VARCHAR(50),
  experience_years INTEGER DEFAULT 0,
  consultation_fee INTEGER DEFAULT 500,
  bio TEXT,
  photo_url TEXT,
  phone_number VARCHAR(20),
  verification_status VARCHAR(50) DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table with video call fields
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(50) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  symptoms TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  payment_method VARCHAR(100),
  transaction_id VARCHAR(255),
  video_room_id VARCHAR(255),
  call_status VARCHAR(50) DEFAULT 'not_started',
  call_offer TEXT,
  call_answer TEXT,
  ice_candidates_doctor TEXT,
  ice_candidates_patient TEXT,
  call_started_at TIMESTAMP,
  call_ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);
CREATE INDEX idx_doctors_verification ON doctors(verification_status);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient_email ON appointments(patient_email);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_video_room ON appointments(video_room_id);

-- Insert sample doctors
INSERT INTO doctors (name, email, specialty, bmdc_number, experience_years, consultation_fee, bio, phone_number, verification_status)
VALUES 
  ('Dr. Md Monsur Helal', 'monsur@shusto.com', 'Medicine Specialist', '18', 20, 800, 'Expert in internal medicine with 20 years of experience', '01712345678', 'approved'),
  ('Dr. Sabbir Ahamed', 'sabbir@shusto.com', 'Health', '19', 6, 1000, 'Experienced health specialist', '01812345679', 'approved'),
  ('Dr. Mehar Nigar', 'mehar@shusto.com', 'Gynaecologist', '7928', 8, 500, 'Women health expert', '01912345680', 'approved');
