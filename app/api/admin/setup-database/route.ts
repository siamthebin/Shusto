import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function POST() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        specialty VARCHAR(255) NOT NULL,
        bmdc_number VARCHAR(50),
        experience_years INTEGER DEFAULT 0,
        consultation_fee INTEGER DEFAULT 500,
        bio TEXT,
        photo_url TEXT,
        phone_number VARCHAR(20),
        verification_status VARCHAR(50) DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty)`
    await sql`CREATE INDEX IF NOT EXISTS idx_doctors_verification ON doctors(verification_status)`

    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER NOT NULL,
        doctor_email VARCHAR(255) NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        patient_email VARCHAR(255) NOT NULL,
        patient_phone VARCHAR(50) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        symptoms TEXT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
        payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
        payment_method VARCHAR(100),
        transaction_id VARCHAR(255),
        video_room_id VARCHAR(255),
        call_status VARCHAR(50) DEFAULT 'not_started',
        call_offer TEXT,
        call_answer TEXT,
        ice_candidates_doctor TEXT,
        ice_candidates_patient TEXT,
        call_started_at TIMESTAMP,
        call_ended_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_appointments_doctor_email ON appointments(doctor_email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON appointments(patient_email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_appointments_video_room ON appointments(video_room_id)`

    await sql`
      INSERT INTO doctors (name, email, specialty, bmdc_number, experience_years, consultation_fee, bio, phone_number, verification_status)
      VALUES 
        ('Dr. Sabbir Ahamed', 'sabbir@example.com', 'Health', '19', 6, 1000, 'Experienced health specialist', '01712345678', 'approved'),
        ('Dr. Mehar Nigar', 'mehar@example.com', 'Gynaecologist', '7928', 8, 500, 'Women health expert', '01887654321', 'approved')
      ON CONFLICT (email) DO NOTHING
    `

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (error) {
    console.error("[v0] Database setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
