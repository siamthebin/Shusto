import { createClient } from "@/lib/supabase/server"

export type ProviderRole = "doctor" | "hospital" | "lab" | "pharmacy" | "physio" | "ambulance" | "patient" | null

export async function detectUserRole(email: string): Promise<{
  role: ProviderRole
  id?: string
  name?: string
}> {
  const supabase = await createClient()

  if (!email) {
    return { role: "patient" }
  }

  const emailLower = email.toLowerCase()

  try {
    // Check doctors table
    const { data: doctor } = await supabase
      .from("doctors")
      .select("id, full_name")
      .eq("email", emailLower)
      .single()

    if (doctor) {
      return { role: "doctor", id: doctor.id, name: doctor.full_name }
    }

    // Check hospitals table
    const { data: hospital } = await supabase
      .from("hospitals")
      .select("id, name")
      .eq("email", emailLower)
      .single()

    if (hospital) {
      return { role: "hospital", id: hospital.id, name: hospital.name }
    }

    // Check labs table
    const { data: lab } = await supabase
      .from("labs")
      .select("id, name")
      .eq("email", emailLower)
      .single()

    if (lab) {
      return { role: "lab", id: lab.id, name: lab.name }
    }

    // Check pharmacies table
    const { data: pharmacy } = await supabase
      .from("pharmacies")
      .select("id, name")
      .eq("email", emailLower)
      .single()

    if (pharmacy) {
      return { role: "pharmacy", id: pharmacy.id, name: pharmacy.name }
    }

    // Check physio table
    const { data: physio } = await supabase
      .from("physio")
      .select("id, name")
      .eq("email", emailLower)
      .single()

    if (physio) {
      return { role: "physio", id: physio.id, name: physio.name }
    }

    // Check ambulance table
    const { data: ambulance } = await supabase
      .from("ambulance")
      .select("id, driver_name")
      .eq("email", emailLower)
      .single()

    if (ambulance) {
      return { role: "ambulance", id: ambulance.id, name: ambulance.driver_name }
    }

    // Default to patient
    return { role: "patient" }
  } catch (error) {
    console.error("[v0] Role detection error:", error)
    return { role: "patient" }
  }
}

export function getRoleDashboardPath(role: ProviderRole): string {
  switch (role) {
    case "doctor":
      return "/doctor/dashboard"
    case "hospital":
      return "/hospital/dashboard"
    case "lab":
      return "/lab/dashboard"
    case "pharmacy":
      return "/pharmacy/dashboard"
    case "physio":
      return "/physio/dashboard"
    case "ambulance":
      return "/ambulance/dashboard"
    case "patient":
    default:
      return "/dashboard"
  }
}
