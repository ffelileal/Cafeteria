import { createClient } from '@/lib/supabase/ssr'

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
