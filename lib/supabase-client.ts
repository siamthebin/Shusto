import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

// Create Supabase browser client
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return createSupabaseBrowserClient("https://placeholder.supabase.co", "placeholder-key")
  }

  return createSupabaseBrowserClient(url, key)
}

// Legacy export for backward compatibility
export function getSupabaseBrowserClient() {
  return createBrowserClient()
}
