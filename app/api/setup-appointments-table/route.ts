import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL) {
      return NextResponse.json({ error: "Database URL not found in environment variables" }, { status: 500 })
    }

    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL!)

    console.log("Recreating appointments table...")

    await sql`DROP TABLE IF EXISTS appointments CASCADE`

    await sql`
      CREATE TABLE appointments (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        patient_name TEXT DEFAULT 'Guest Patient',
        patient_email TEXT,
        patient_phone TEXT,
        appointment_date DATE DEFAULT CURRENT_DATE,
        appointment_time TIME DEFAULT CURRENT_TIME,
        symptoms TEXT,
        status TEXT DEFAULT 'pending',
        payment_status TEXT DEFAULT 'unpaid',
        video_room_id TEXT,
        call_offer TEXT,
        call_answer TEXT,
        ice_candidates_doctor TEXT,
        ice_candidates_patient TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    console.log("Inserting test data...")
    await sql`
        INSERT INTO appointments (doctor_id, doctor_name, patient_name, symptoms, status)
        VALUES 
            ('1', 'Blue Doctor', 'Karim Ahmed', 'Fever (Fixed Schema)', 'pending'),
            ('1', 'Blue Doctor', 'Fatima Khan', 'Headache (Fixed Schema)', 'pending');
        `

    await sql`NOTIFY pgrst, 'reload schema'`

    // List recent appointments to confirm
    const recent = await sql`SELECT * FROM appointments ORDER BY id DESC LIMIT 5`

    return NextResponse.json({
      success: true,
      message: "Table recreated and test data inserted successfully",
      recent_data: recent,
    })
  } catch (error: any) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: error.message, details: error }, { status: 500 })
  }
}
