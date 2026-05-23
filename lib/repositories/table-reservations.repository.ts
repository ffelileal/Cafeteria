// Server-only — uses service-role key
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { TableReservationRow, UUID } from '@/types/database'
import { RepositoryError, type CreateTableReservationInput } from './types'

function repoError(msg: string, code?: string): RepositoryError {
  return new RepositoryError(msg, code)
}

export async function createReservation(
  input: CreateTableReservationInput
): Promise<TableReservationRow> {
  const { data, error } = await supabaseAdmin
    .from('table_reservations')
    .insert({
      table_id: input.table_id,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_email: input.customer_email,
      reservation_date: input.reservation_date,
      people_count: input.people_count,
      notes: input.notes ?? null,
      status: input.status ?? 'pending',
    })
    .select()
    .single()

  if (error) throw repoError('Failed to create table reservation', error.code)
  return data as TableReservationRow
}

export async function getReservations(tableId?: UUID): Promise<TableReservationRow[]> {
  let query = supabaseAdmin
    .from('table_reservations')
    .select('*')
    .order('reservation_date', { ascending: true })

  if (tableId) {
    query = query.eq('table_id', tableId)
  }

  const { data, error } = await query
  if (error) throw repoError('Failed to fetch table reservations', error.code)
  return (data ?? []) as TableReservationRow[]
}

export async function getReservationById(id: UUID): Promise<TableReservationRow | null> {
  const { data, error } = await supabaseAdmin
    .from('table_reservations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw repoError('Failed to fetch table reservation', error.code)
  }
  return data as TableReservationRow
}

export async function cancelReservation(id: UUID): Promise<void> {
  const { error } = await supabaseAdmin
    .from('table_reservations')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) throw repoError('Failed to cancel table reservation', error.code)
}
