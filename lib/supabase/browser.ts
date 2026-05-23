import { createBrowserClient } from '@supabase/ssr'

// Use this client in client components — it reads the auth session from cookies
// so realtime subscriptions honour RLS policies for the logged-in admin user.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
