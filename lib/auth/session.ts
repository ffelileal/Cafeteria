import { createClient } from '@/lib/supabase/ssr'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

// Comma-separated list of admin emails. Empty = allow any authenticated user.
const ALLOWED = (process.env.ADMIN_ALLOWED_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  if (ALLOWED.length === 0) return true
  return ALLOWED.includes(email.toLowerCase())
}

export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAllowedAdmin(user.email)) return null
  return user
}

// Use in server components / layouts — redirects to login if not authorised.
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')
  return user
}
