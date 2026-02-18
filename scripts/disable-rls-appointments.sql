-- Disable Row Level Security on appointments table to allow INSERT operations
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Alternatively, create a policy that allows all operations (more secure approach)
-- First drop any existing policies
DROP POLICY IF EXISTS "Enable all operations for appointments" ON appointments;

-- Create a permissive policy that allows all operations
CREATE POLICY "Enable all operations for appointments" 
ON appointments 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Enable RLS with the permissive policy
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Verify the table and policy
SELECT * FROM appointments LIMIT 1;
