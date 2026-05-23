'use server'

import { createReservation, getReservations } from '@/lib/repositories/reservations.repository'
import type { ReservationRow, UUID } from '@/types/database'
import type { ActionResponse } from './types'

export interface ReservationActionResponse extends ActionResponse<ReservationRow[]> {}
export interface CreateReservationActionResponse extends ActionResponse<ReservationRow> {}

export async function createReservationAction(input: {
  customer_id: UUID
  reservation_date: string
  party_size: number
  status?: ReservationRow['status']
  notes?: string | null
}): Promise<CreateReservationActionResponse> {
  try {
    const data = await createReservation(input)

    return {
      status: 'success',
      data,
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'No se pudo crear la reservación',
    }
  }
}

export async function getReservationsAction(customerId?: UUID): Promise<ReservationActionResponse> {
  try {
    const data = await getReservations(customerId)

    return {
      status: 'success',
      data,
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'No se pudo obtener las reservaciones',
    }
  }
}
