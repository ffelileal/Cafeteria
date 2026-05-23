import { supabaseServer } from '@/lib/supabase/server'
import type { ReservationRow, UUID } from '@/types/database'
import { RepositoryError, type CreateReservationInput } from './types'

function mapPostgrestError(message: string, errorCode?: string): RepositoryError {
  return new RepositoryError(message, errorCode)
}

export async function createReservation(input: CreateReservationInput): Promise<ReservationRow> {
  const { data, error } = await supabaseServer
    .from('reservations')
    .insert({
      customer_id: input.customer_id,
      reservation_date: input.reservation_date,
      party_size: input.party_size,
      status: input.status ?? 'pending',
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (error) {
    throw mapPostgrestError('Failed to create reservation', error.code)
  }

  return data as ReservationRow
}

export async function getReservations(customerId?: UUID): Promise<ReservationRow[]> {
  let query = supabaseServer.from('reservations').select('*')

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }

  query = query.order('reservation_date', { ascending: true })

  const { data, error } = await query

  if (error) {
    throw mapPostgrestError('Failed to fetch reservations', error.code)
  }

  return (data ?? []) as ReservationRow[]
}

export async function getReservationById(id: UUID): Promise<ReservationRow | null> {
  const { data, error } = await supabaseServer
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }

    throw mapPostgrestError('Failed to fetch reservation', error.code)
  }

  return data as ReservationRow | null
}
