import { createClient } from '@supabase/supabase-js'

function getUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  return url
}

function getServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return key
}

// Server-only — never import from client components
export const supabaseAdmin = createClient(getUrl(), getServiceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
})
