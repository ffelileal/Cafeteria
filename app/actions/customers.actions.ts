'use server'

import { createCustomer } from '@/lib/repositories/customers.repository'
import type { CustomerRow } from '@/types/database'
import type { ActionResponse } from './types'

export interface CustomerActionResponse extends ActionResponse<CustomerRow> {}

export async function createCustomerAction(input: {
  full_name: string
  email: string
  phone?: string | null
  address?: string | null
}): Promise<CustomerActionResponse> {
  try {
    const data = await createCustomer(input)

    return {
      status: 'success',
      data,
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'No se pudo crear el cliente',
    }
  }
}
