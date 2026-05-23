import { supabaseServer } from '@/lib/supabase/server'
import type { ProductRow, UUID } from '@/types/database'
import { RepositoryError } from './types'

export interface GetProductsOptions {
  limit?: number
  category?: ProductRow['category']
}

function mapPostgrestError(message: string, errorCode?: string): RepositoryError {
  return new RepositoryError(message, errorCode)
}

export async function getProducts(options: GetProductsOptions = {}): Promise<ProductRow[]> {
  const query = supabaseServer
    .from('products')
    .select('*')
    .eq('is_active', true)

  if (options.category) {
    query.eq('category', options.category)
  }

  if (options.limit) {
    query.limit(options.limit)
  }

  query.order('popularity', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw mapPostgrestError('Failed to fetch products', error.code)
  }

  return (data ?? []) as ProductRow[]
}

export async function getFeaturedProducts(limit = 6): Promise<ProductRow[]> {
  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('popularity', { ascending: false })
    .limit(limit)

  if (error) {
    throw mapPostgrestError('Failed to fetch featured products', error.code)
  }

  return (data ?? []) as ProductRow[]
}

export async function getProductById(id: UUID): Promise<ProductRow | null> {
  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }

    throw mapPostgrestError('Failed to fetch product', error.code)
  }

  return data as ProductRow | null
}
