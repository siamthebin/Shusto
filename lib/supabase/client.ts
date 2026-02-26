import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn("[v0] Supabase environment variables are missing. Auth features will be disabled.")
    // Return a mock client that won't crash
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
      },
    } as any
  }

  return createBrowserClient(url, key)
}

// Export as named export for direct use
export { createClient as createBrowserClient }
