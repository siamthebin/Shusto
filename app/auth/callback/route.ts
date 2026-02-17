import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || "")}`,
    )
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      },
    )

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent(exchangeError.message)}`,
      )
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
