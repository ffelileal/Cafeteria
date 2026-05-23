'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { signInWithEmail } from '@/lib/auth/login'
import { signOut } from '@/lib/auth/logout'
import { getAdminUser } from '@/lib/auth/session'
import type { OrderStatus, ReservationStatus, TableStatus, TableReservationStatus } from '@/types/database'

// ── Auth ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export interface AuthActionState {
  error?: string
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
  }

  const result = await signInWithEmail(parsed.data.email, parsed.data.password)
  if (result.error) return { error: result.error }

  redirect('/admin/dashboard')
}

export async function logoutAction(): Promise<never> {
  await signOut()
  redirect('/admin/login')
}

// ── Orders ──────────────────────────────────────────────────────────────────

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]

export interface UpdateStatusState {
  error?: string
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<UpdateStatusState> {
  if (!VALID_STATUSES.includes(status)) {
    return { error: 'Estado inválido' }
  }

  const user = await getAdminUser()
  if (!user) {
    return { error: 'No autorizado' }
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    return { error: 'No se pudo actualizar el estado' }
  }

  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/orders')
  return {}
}

// ── Reservations ─────────────────────────────────────────────────────────────

const VALID_RESERVATION_STATUSES: ReservationStatus[] = [
  'pending', 'confirmed', 'cancelled', 'completed',
]

export async function updateReservationStatusAction(
  reservationId: string,
  status: ReservationStatus,
): Promise<UpdateStatusState> {
  if (!VALID_RESERVATION_STATUSES.includes(status)) {
    return { error: 'Estado inválido' }
  }

  const user = await getAdminUser()
  if (!user) return { error: 'No autorizado' }

  const { error } = await supabaseAdmin
    .from('reservations')
    .update({ status })
    .eq('id', reservationId)

  if (error) return { error: 'No se pudo actualizar el estado' }

  revalidatePath('/admin/reservations')
  revalidatePath('/admin/dashboard')
  return {}
}

// ── Table actions ─────────────────────────────────────────────────────────────

export async function updateTableStatusAction(
  tableId: string,
  status: TableStatus
): Promise<{ error?: string }> {
  const user = await getAdminUser()
  if (!user) return { error: 'No autorizado' }

  const { error } = await supabaseAdmin
    .from('tables')
    .update({ status })
    .eq('id', tableId)

  if (error) return { error: 'No se pudo actualizar el estado' }

  revalidatePath('/admin/tables')
  revalidatePath('/admin/dashboard')
  return {}
}

export async function updateTableReservationStatusAction(
  reservationId: string,
  status: TableReservationStatus
): Promise<{ error?: string }> {
  const user = await getAdminUser()
  if (!user) return { error: 'No autorizado' }

  const { error } = await supabaseAdmin
    .from('table_reservations')
    .update({ status })
    .eq('id', reservationId)

  if (error) return { error: 'No se pudo actualizar el estado' }

  revalidatePath('/admin/tables')
  return {}
}
