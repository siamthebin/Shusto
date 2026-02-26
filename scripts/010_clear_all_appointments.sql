-- Clear all existing appointments to start fresh
DELETE FROM appointments;

-- Reset the sequence/counter for appointments ID
ALTER SEQUENCE appointments_id_seq RESTART WITH 1;
