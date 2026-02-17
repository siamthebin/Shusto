-- Add revenue tracking columns to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS doctor_earnings DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS platform_commission DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS doctor_payout_status VARCHAR(50) DEFAULT 'pending' CHECK (doctor_payout_status IN ('pending', 'completed', 'failed'));

-- Create doctor_earnings table to track payouts
CREATE TABLE IF NOT EXISTS doctor_earnings (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  payout_method VARCHAR(100),
  payout_transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);

-- Create platform_earnings table for commission tracking
CREATE TABLE IF NOT EXISTS platform_earnings (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_doctor_earnings_doctor ON doctor_earnings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_earnings_status ON doctor_earnings(status);
CREATE INDEX IF NOT EXISTS idx_platform_earnings_appointment ON platform_earnings(appointment_id);

COMMENT ON TABLE doctor_earnings IS 'Tracks doctor earnings from appointments (70% of consultation fee)';
COMMENT ON TABLE platform_earnings IS 'Tracks platform commission from appointments (30% of consultation fee)';
