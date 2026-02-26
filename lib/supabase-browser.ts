import { createBrowserClient as createClient } from '@supabase/ssr'

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return createClient("https://placeholder.supabase.co", "placeholder-key")
  }

  return createClient(url, key)
}
