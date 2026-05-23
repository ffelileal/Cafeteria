import { supabaseServer } from '@/lib/supabase/server'
import type { CustomerRow, UUID } from '@/types/database'
import { RepositoryError, type CreateCustomerInput } from './types'

function mapPostgrestError(message: string, errorCode?: string): RepositoryError {
  return new RepositoryError(message, errorCode)
}

export async function createCustomer(input: CreateCustomerInput): Promise<CustomerRow> {
  const { data, error } = await supabaseServer
    .from('customers')
    .insert({
      full_name: input.full_name,
      email: input.email,
      phone: input.phone ?? null,
      address: input.address ?? null,
    })
    .select()
    .single()

  if (error) {
    throw mapPostgrestError('Failed to create customer', error.code)
  }

  return data as CustomerRow
}

export async function getCustomerByEmail(email: string): Promise<CustomerRow | null> {
  const { data, error } = await supabaseServer
    .from('customers')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }

    throw mapPostgrestError('Failed to fetch customer by email', error.code)
  }

  return data as CustomerRow | null
}

export async function getCustomerById(id: UUID): Promise<CustomerRow | null> {
  const { data, error } = await supabaseServer
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }

    throw mapPostgrestError('Failed to fetch customer', error.code)
  }

  return data as CustomerRow | null
}
