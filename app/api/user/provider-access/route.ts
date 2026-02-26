import { NextRequest, NextResponse } from "next/server"
import { getUserProviderAccess } from "@/lib/rbac"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userEmail = searchParams.get("email")

    if (!userEmail) {
      return NextResponse.json({ error: "email query parameter is required" }, { status: 400 })
    }

    const providerAccess = await getUserProviderAccess(userEmail)

    return NextResponse.json({
      success: true,
      providers: providerAccess,
      count: providerAccess.length,
    })
  } catch (error: any) {
    console.error("[v0] Error getting user provider access:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get provider access" },
      { status: 500 }
    )
  }
}
