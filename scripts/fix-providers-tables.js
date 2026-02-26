import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL);

async function migrate() {
  console.log("Starting migration...");

  // Create hospitals table
  await sql`
    CREATE TABLE IF NOT EXISTS hospitals (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      emergency_number TEXT,
      specialties TEXT,
      bed_count TEXT,
      is_active BOOLEAN DEFAULT true,
      is_paused BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("hospitals table created/verified");

  // Create ambulances table
  await sql`
    CREATE TABLE IF NOT EXISTS ambulances (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      type TEXT DEFAULT 'basic',
      driver_name TEXT,
      vehicle_number TEXT,
      is_active BOOLEAN DEFAULT true,
      is_paused BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("ambulances table created/verified");

  // Create physiotherapists table
  await sql`
    CREATE TABLE IF NOT EXISTS physiotherapists (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      specialization TEXT,
      experience_years TEXT,
      is_active BOOLEAN DEFAULT true,
      is_paused BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("physiotherapists table created/verified");

  // Create labs table
  await sql`
    CREATE TABLE IF NOT EXISTS labs (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      license_number TEXT,
      owner_name TEXT,
      is_active BOOLEAN DEFAULT true,
      is_paused BOOLEAN DEFAULT false,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("labs table created/verified");

  // Add missing columns to orders table
  try {
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'medicine'`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_lab_id INTEGER`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_lab_name TEXT`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_physio_id INTEGER`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_physio_name TEXT`;
    console.log("orders table updated with new columns");
  } catch (e) {
    console.log("orders columns may already exist or table missing:", e.message);
  }

  // Verify by counting rows
  const hospitals = await sql`SELECT COUNT(*) as count FROM hospitals`;
  const ambulances = await sql`SELECT COUNT(*) as count FROM ambulances`;
  const physios = await sql`SELECT COUNT(*) as count FROM physiotherapists`;
  const labs = await sql`SELECT COUNT(*) as count FROM labs`;

  console.log("Current data:");
  console.log("Hospitals:", hospitals[0].count);
  console.log("Ambulances:", ambulances[0].count);
  console.log("Physiotherapists:", physios[0].count);
  console.log("Labs:", labs[0].count);

  console.log("Migration complete!");
}

migrate().catch(console.error);
