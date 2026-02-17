import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL);

async function fixColumns() {
  console.log("Fixing missing columns...");

  // Add missing columns to ambulances
  try { await sql`ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'basic'`; } catch(e) { console.log("vehicle_type:", e.message); }
  try { await sql`ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS service_area TEXT`; } catch(e) { console.log("service_area:", e.message); }
  
  // Add missing columns to physiotherapists  
  try { await sql`ALTER TABLE physiotherapists ADD COLUMN IF NOT EXISTS consultation_fee INTEGER DEFAULT 500`; } catch(e) { console.log("consultation_fee:", e.message); }
  try { await sql`ALTER TABLE physiotherapists ADD COLUMN IF NOT EXISTS qualification TEXT`; } catch(e) { console.log("qualification:", e.message); }

  // Add missing columns to hospitals
  try { await sql`ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`; } catch(e) { console.log("latitude:", e.message); }
  try { await sql`ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`; } catch(e) { console.log("longitude:", e.message); }

  // Add missing columns to ambulances
  try { await sql`ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`; } catch(e) { console.log("latitude:", e.message); }
  try { await sql`ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`; } catch(e) { console.log("longitude:", e.message); }

  // Add missing columns to physiotherapists
  try { await sql`ALTER TABLE physiotherapists ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`; } catch(e) { console.log("latitude:", e.message); }
  try { await sql`ALTER TABLE physiotherapists ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`; } catch(e) { console.log("longitude:", e.message); }

  // Verify all tables
  const h = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'hospitals' ORDER BY ordinal_position`;
  const a = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'ambulances' ORDER BY ordinal_position`;
  const p = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'physiotherapists' ORDER BY ordinal_position`;
  const l = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'labs' ORDER BY ordinal_position`;

  console.log("Hospital columns:", h.map(r => r.column_name).join(", "));
  console.log("Ambulance columns:", a.map(r => r.column_name).join(", "));
  console.log("Physio columns:", p.map(r => r.column_name).join(", "));
  console.log("Lab columns:", l.map(r => r.column_name).join(", "));

  // Test insert a hospital
  try {
    const testH = await sql`INSERT INTO hospitals (name, email, phone, address) VALUES ('Test Hospital', 'test@test.com', '01700000000', 'Dhaka') RETURNING *`;
    console.log("Test hospital inserted:", testH[0].id);
    // Delete test
    await sql`DELETE FROM hospitals WHERE email = 'test@test.com'`;
    console.log("Test hospital deleted");
  } catch(e) {
    console.log("Test insert error:", e.message);
  }

  console.log("Done!");
}

fixColumns().catch(console.error);
