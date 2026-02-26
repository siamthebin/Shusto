-- Add phone_number field to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Update sample doctors with phone numbers
UPDATE doctors SET phone_number = '01712345678' WHERE email = 'sabbir@example.com';
UPDATE doctors SET phone_number = '01887654321' WHERE email = 'mehar@example.com';
