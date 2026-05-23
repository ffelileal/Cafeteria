'use server'

import { getFeaturedProducts, getProducts } from '@/lib/repositories/products.repository'
import type { ProductRow } from '@/types/database'
import type { ActionResponse } from './types'

export interface ProductActionResponse extends ActionResponse<ProductRow[]> {}

export async function getProductsAction(): Promise<ProductActionResponse> {
  try {
    const data = await getProducts()

    return {
      status: 'success',
      data,
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'No se pudo obtener los productos',
    }
  }
}

export async function getFeaturedProductsAction(): Promise<ProductActionResponse> {
  try {
    const data = await getFeaturedProducts()

    return {
      status: 'success',
      data,
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'No se pudo obtener los productos destacados',
    }
  }
}
