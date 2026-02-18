-- Force Supabase PostgREST to reload the schema cache
NOTIFY pgrst, 'reload config';
