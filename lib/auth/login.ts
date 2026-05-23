import { createClient } from '@/lib/supabase/ssr'
import { isAllowedAdmin } from './session'

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  if (!isAllowedAdmin(email)) {
    return { error: 'No tenés autorización para acceder al panel.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email o contraseña incorrectos.' }
  }

  return {}
}
