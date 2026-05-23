// Server-only — uses service-role key
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { TableRow, TableStatus, UUID } from '@/types/database'
import { RepositoryError } from './types'

function repoError(msg: string, code?: string): RepositoryError {
  return new RepositoryError(msg, code)
}

export async function getTables(): Promise<TableRow[]> {
  const { data, error } = await supabaseAdmin
    .from('tables')
    .select('*')
    .order('table_number', { ascending: true })

  if (error) throw repoError('Failed to fetch tables', error.code)
  return (data ?? []) as TableRow[]
}

export async function getTableById(id: UUID): Promise<TableRow | null> {
  const { data, error } = await supabaseAdmin
    .from('tables')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw repoError('Failed to fetch table', error.code)
  }
  return data as TableRow
}

export async function getTableBySlug(slug: string): Promise<TableRow | null> {
  const { data, error } = await supabaseAdmin
    .from('tables')
    .select('*')
    .eq('qr_slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw repoError('Failed to fetch table', error.code)
  }
  return data as TableRow
}

export async function getAvailableTables(): Promise<TableRow[]> {
  const { data, error } = await supabaseAdmin
    .from('tables')
    .select('*')
    .eq('status', 'available')
    .order('table_number', { ascending: true })

  if (error) throw repoError('Failed to fetch available tables', error.code)
  return (data ?? []) as TableRow[]
}

export async function updateTableStatus(id: UUID, status: TableStatus): Promise<void> {
  const { error } = await supabaseAdmin
    .from('tables')
    .update({ status })
    .eq('id', id)

  if (error) throw repoError('Failed to update table status', error.code)
}
