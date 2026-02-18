import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL);

async function fix() {
  try { await sql`ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false`; } catch(e) { console.log(e.message); }
  try { await sql`ALTER TABLE ambulances ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false`; } catch(e) { console.log(e.message); }
  try { await sql`ALTER TABLE physiotherapists ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false`; } catch(e) { console.log(e.message); }
  try { await sql`ALTER TABLE labs ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false`; } catch(e) { console.log(e.message); }
  try { await sql`ALTER TABLE labs ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`; } catch(e) { console.log(e.message); }
  try { await sql`ALTER TABLE labs ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`; } catch(e) { console.log(e.message); }
  
  // Verify counts
  const h = await sql`SELECT COUNT(*) as c FROM hospitals`;
  const a = await sql`SELECT COUNT(*) as c FROM ambulances`;
  const p = await sql`SELECT COUNT(*) as c FROM physiotherapists`;
  const l = await sql`SELECT COUNT(*) as c FROM labs`;
  console.log("Hospitals:", h[0].c, "| Ambulances:", a[0].c, "| Physios:", p[0].c, "| Labs:", l[0].c);
  console.log("Done!");
}
fix().catch(console.error);
