import { createClient } from '@/lib/supabase/client'

interface ProtectionResult {
  isAuthorized: boolean
  provider?: {
    id: string
    name: string
    email: string
  }
  error?: string
}

/**
 * Verify that the logged-in user is the ONLY one who can access their own dashboard
 * This prevents unauthorized access to other provider's dashboards
 */
export async function protectDashboard(
  requiredRole: 'doctor' | 'lab' | 'hospital' | 'pharmacy' | 'physio' | 'ambulance'
): Promise<ProtectionResult> {
  try {
    const supabase = createClient()

    // Get current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user?.email) {
      console.log('[v0] Dashboard Protection: No authenticated user')
      return {
        isAuthorized: false,
        error: 'প্রথমে লগইন করুন',
      }
    }

    const emailLower = user.email.toLowerCase()
    console.log('[v0] Dashboard Protection: Checking access for email:', emailLower)

    // Check if user exists in the correct provider table
    if (requiredRole === 'doctor') {
      const { data: doctor, error } = await supabase
        .from('doctors')
        .select('id, full_name, email')
        .eq('email', emailLower)
        .single()

      if (error || !doctor) {
        return {
          isAuthorized: false,
          error: 'আপনি একজন ডাক্তার নন',
        }
      }

      console.log('[v0] Dashboard Protection: Doctor authorized -', doctor.full_name)
      return {
        isAuthorized: true,
        provider: {
          id: doctor.id,
          name: doctor.full_name,
          email: doctor.email,
        },
      }
    }

    if (requiredRole === 'lab') {
      const { data: lab, error } = await supabase
        .from('labs')
        .select('id, name, email')
        .eq('email', emailLower)
        .single()

      if (error || !lab) {
        return {
          isAuthorized: false,
          error: 'আপনি একটি ল্যাব নন',
        }
      }

      console.log('[v0] Dashboard Protection: Lab authorized -', lab.name)
      return {
        isAuthorized: true,
        provider: {
          id: lab.id,
          name: lab.name,
          email: lab.email,
        },
      }
    }

    if (requiredRole === 'hospital') {
      const { data: hospital, error } = await supabase
        .from('hospitals')
        .select('id, name, email')
        .eq('email', emailLower)
        .single()

      if (error || !hospital) {
        return {
          isAuthorized: false,
          error: 'আপনি একটি হাসপাতাল নন',
        }
      }

      console.log('[v0] Dashboard Protection: Hospital authorized -', hospital.name)
      return {
        isAuthorized: true,
        provider: {
          id: hospital.id,
          name: hospital.name,
          email: hospital.email,
        },
      }
    }

    if (requiredRole === 'pharmacy') {
      const { data: pharmacy, error } = await supabase
        .from('pharmacies')
        .select('id, name, email')
        .eq('email', emailLower)
        .single()

      if (error || !pharmacy) {
        return {
          isAuthorized: false,
          error: 'আপনি একটি ফার্মেসি নন',
        }
      }

      console.log('[v0] Dashboard Protection: Pharmacy authorized -', pharmacy.name)
      return {
        isAuthorized: true,
        provider: {
          id: pharmacy.id,
          name: pharmacy.name,
          email: pharmacy.email,
        },
      }
    }

    if (requiredRole === 'physio') {
      const { data: physio, error } = await supabase
        .from('physio')
        .select('id, name, email')
        .eq('email', emailLower)
        .single()

      if (error || !physio) {
        return {
          isAuthorized: false,
          error: 'আপনি একজন থেরাপিস্ট নন',
        }
      }

      console.log('[v0] Dashboard Protection: Physio authorized -', physio.name)
      return {
        isAuthorized: true,
        provider: {
          id: physio.id,
          name: physio.name,
          email: physio.email,
        },
      }
    }

    if (requiredRole === 'ambulance') {
      const { data: ambulance, error } = await supabase
        .from('ambulance')
        .select('id, driver_name, email')
        .eq('email', emailLower)
        .single()

      if (error || !ambulance) {
        return {
          isAuthorized: false,
          error: 'আপনি একটি অ্যাম্বুলেন্স চালক নন',
        }
      }

      console.log('[v0] Dashboard Protection: Ambulance authorized -', ambulance.driver_name)
      return {
        isAuthorized: true,
        provider: {
          id: ambulance.id,
          name: ambulance.driver_name,
          email: ambulance.email,
        },
      }
    }

    return {
      isAuthorized: false,
      error: 'অজানা ভূমিকা',
    }
  } catch (error) {
    console.error('[v0] Dashboard Protection Error:', error)
    return {
      isAuthorized: false,
      error: 'সিস্টেম ত্রুটি হয়েছে',
    }
  }
}
