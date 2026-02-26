-- Create prescriptions table for doctor-patient system
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER,
    doctor_id INTEGER NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    diagnosis TEXT,
    medicines JSONB NOT NULL,
    instructions TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_email);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created ON prescriptions(created_at DESC);

-- Verify table was created
SELECT 'Prescriptions table created successfully!' AS message;
