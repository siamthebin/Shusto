import { createClient } from "@supabase/supabase-js"

export type ProviderType = "doctor" | "pharmacy" | "lab" | "hospital" | "ambulance" | "physio"
export type UserRole = "owner" | "editor" | "manager" | "viewer"

export interface ProviderRole {
  id: string
  provider_type: ProviderType
  provider_id: string
  user_email: string
  role: UserRole
  granted_by?: string
  granted_at: string
  revoked_at?: string
  is_active: boolean
}

export interface UserProviderAccess {
  provider_id: string
  provider_type: ProviderType
  provider_name: string
  role: UserRole
  owner_email: string
}

/**
 * Get Supabase client with service role key for admin operations
 */
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Check if user has a specific role for a provider
 */
export async function checkUserRole(
  userEmail: string,
  providerId: string,
  providerType: ProviderType,
  requiredRole: UserRole
): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from("provider_roles")
    .select("*")
    .eq("user_email", userEmail.toLowerCase())
    .eq("provider_id", providerId)
    .eq("provider_type", providerType)
    .eq("is_active", true)
    .single()

  if (error || !data) return false

  const roleHierarchy: Record<UserRole, number> = {
    owner: 4,
    editor: 3,
    manager: 2,
    viewer: 1,
  }

  return roleHierarchy[data.role as UserRole] >= roleHierarchy[requiredRole]
}

/**
 * Grant a user access to a provider with a specific role
 */
export async function grantProviderAccess(
  userEmail: string,
  providerId: string,
  providerType: ProviderType,
  role: UserRole,
  grantedBy: string
): Promise<ProviderRole | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from("provider_roles")
    .upsert(
      {
        user_email: userEmail.toLowerCase(),
        provider_id: providerId,
        provider_type: providerType,
        role,
        granted_by: grantedBy,
        granted_at: new Date().toISOString(),
        is_active: true,
      },
      { onConflict: "provider_type,provider_id,user_email" }
    )
    .select()
    .single()

  if (error) {
    console.error("[v0] Error granting provider access:", error)
    return null
  }

  return data
}

/**
 * Revoke user access to a provider
 */
export async function revokeProviderAccess(
  userEmail: string,
  providerId: string,
  providerType: ProviderType
): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from("provider_roles")
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
    })
    .eq("user_email", userEmail.toLowerCase())
    .eq("provider_id", providerId)
    .eq("provider_type", providerType)

  if (error) {
    console.error("[v0] Error revoking provider access:", error)
    return false
  }

  return true
}

/**
 * Get all providers a user has access to
 */
export async function getUserProviderAccess(userEmail: string): Promise<UserProviderAccess[]> {
  const supabase = getSupabaseAdmin()

  const { data: roles, error } = await supabase
    .from("provider_roles")
    .select("*")
    .eq("user_email", userEmail.toLowerCase())
    .eq("is_active", true)

  if (error || !roles) {
    console.error("[v0] Error getting user provider access:", error)
    return []
  }

  // Get details for each provider
  const providerAccess: UserProviderAccess[] = []

  for (const role of roles) {
    const table = `${role.provider_type}s`
    const { data: provider } = await supabase
      .from(table)
      .select("id, name")
      .eq("id", role.provider_id)
      .single()

    if (provider) {
      providerAccess.push({
        provider_id: role.provider_id,
        provider_type: role.provider_type as ProviderType,
        provider_name: provider.name,
        role: role.role as UserRole,
        owner_email: role.owner_email || "unknown",
      })
    }
  }

  return providerAccess
}

/**
 * Get all users with access to a specific provider
 */
export async function getProviderUsers(
  providerId: string,
  providerType: ProviderType
): Promise<ProviderRole[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from("provider_roles")
    .select("*")
    .eq("provider_id", providerId)
    .eq("provider_type", providerType)
    .eq("is_active", true)
    .order("granted_at", { ascending: false })

  if (error) {
    console.error("[v0] Error getting provider users:", error)
    return []
  }

  return data || []
}

/**
 * Check if user is owner of a provider
 */
export async function isProviderOwner(
  userEmail: string,
  providerId: string,
  providerType: ProviderType
): Promise<boolean> {
  return checkUserRole(userEmail, providerId, providerType, "owner")
}

/**
 * Get role hierarchy level (for permission checking)
 */
export function getRoleLevel(role: UserRole): number {
  const roleHierarchy: Record<UserRole, number> = {
    owner: 4,
    editor: 3,
    manager: 2,
    viewer: 1,
  }
  return roleHierarchy[role]
}

/**
 * Check if a role has permission for an action
 */
export function canPerformAction(userRole: UserRole, action: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    owner: ["read", "write", "delete", "manage_team", "manage_roles", "view_analytics"],
    editor: ["read", "write", "manage_team", "view_analytics"],
    manager: ["read", "write", "view_analytics"],
    viewer: ["read"],
  }

  return permissions[userRole].includes(action)
}
