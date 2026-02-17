import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { providerId, providerType, isPaused } = await request.json()

    if (!providerId || !providerType) {
      return NextResponse.json(
        { error: "Provider ID and type are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Map provider type to table name
    const tableMap: { [key: string]: string } = {
      ambulance: "ambulances",
      lab: "labs",
      physio: "physiotherapists",
      pharmacy: "pharmacies",
    }

    const tableName = tableMap[providerType]
    if (!tableName) {
      return NextResponse.json(
        { error: "Invalid provider type" },
        { status: 400 }
      )
    }

    // Update provider pause status
    const { data, error } = await supabase
      .from(tableName)
      .update({ is_paused: isPaused })
      .eq("id", providerId)
      .select()
      .single()

    if (error) {
      console.error("Error updating provider status:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: isPaused ? "Service paused" : "Service resumed",
      provider: data,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("id")
    const providerType = searchParams.get("type")

    if (!providerId || !providerType) {
      return NextResponse.json(
        { error: "Provider ID and type are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const tableMap: { [key: string]: string } = {
      ambulance: "ambulances",
      lab: "labs",
      physio: "physiotherapists",
      pharmacy: "pharmacies",
    }

    const tableName = tableMap[providerType]
    if (!tableName) {
      return NextResponse.json(
        { error: "Invalid provider type" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from(tableName)
      .select("id, name, is_paused")
      .eq("id", providerId)
      .single()

    if (error) {
      console.error("Error fetching provider:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ provider: data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
