import { detectUserRole, getRoleDashboardPath } from "@/lib/role-detection"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const { role } = await detectUserRole(email)
    const dashboardPath = getRoleDashboardPath(role)

    return NextResponse.json({
      role,
      dashboardPath,
    })
  } catch (error) {
    console.error("[v0] Role detection API error:", error)
    return NextResponse.json(
      { error: "Role detection failed", dashboardPath: "/dashboard" },
      { status: 500 },
    )
  }
}
