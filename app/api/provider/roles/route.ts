import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { grantProviderAccess, revokeProviderAccess, getProviderUsers, isProviderOwner } from "@/lib/rbac"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const providerId = searchParams.get("provider_id")
    const providerType = searchParams.get("provider_type")
    const userEmail = searchParams.get("user_email")

    if (!providerId || !providerType) {
      return NextResponse.json(
        { error: "provider_id and provider_type are required" },
        { status: 400 }
      )
    }

    // Verify user is owner before showing team
    if (!userEmail) {
      return NextResponse.json({ error: "user_email is required" }, { status: 400 })
    }

    const isOwner = await isProviderOwner(userEmail, providerId, providerType as any)
    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const users = await getProviderUsers(providerId, providerType as any)
    return NextResponse.json({ success: true, users })
  } catch (error: any) {
    console.error("[v0] Error getting provider users:", error)
    return NextResponse.json({ error: error.message || "Failed to get users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_email, provider_id, provider_type, role, granted_by } = body

    if (!user_email || !provider_id || !provider_type || !role || !granted_by) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify grantor is owner
    const isOwner = await isProviderOwner(granted_by, provider_id, provider_type)
    if (!isOwner) {
      return NextResponse.json(
        { error: "Only owners can grant access" },
        { status: 403 }
      )
    }

    const result = await grantProviderAccess(user_email, provider_id, provider_type, role, granted_by)

    if (!result) {
      return NextResponse.json({ error: "Failed to grant access" }, { status: 500 })
    }

    console.log("[v0] Access granted:", { user_email, provider_id, provider_type, role })
    return NextResponse.json({ success: true, access: result })
  } catch (error: any) {
    console.error("[v0] Error granting provider access:", error)
    return NextResponse.json({ error: error.message || "Failed to grant access" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_email, provider_id, provider_type, revoked_by } = body

    if (!user_email || !provider_id || !provider_type || !revoked_by) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify revoker is owner
    const isOwner = await isProviderOwner(revoked_by, provider_id, provider_type)
    if (!isOwner) {
      return NextResponse.json(
        { error: "Only owners can revoke access" },
        { status: 403 }
      )
    }

    const success = await revokeProviderAccess(user_email, provider_id, provider_type)

    if (!success) {
      return NextResponse.json({ error: "Failed to revoke access" }, { status: 500 })
    }

    console.log("[v0] Access revoked:", { user_email, provider_id, provider_type })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error revoking provider access:", error)
    return NextResponse.json({ error: error.message || "Failed to revoke access" }, { status: 500 })
  }
}
