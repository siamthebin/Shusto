import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Allow all requests through without authentication
  return NextResponse.next({
    request,
  })
}
