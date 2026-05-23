'use client'

import { useState, useEffect } from 'react'
import { fetchMenuProducts } from '@/services/products'
import type { FetchedMenuCategory, MenuProduct } from '@/services/products'

export type MenuItemWithCategoryData = MenuProduct & {
  categoryName: string
  categoryId: string
}

export interface UseProductsResult {
  categories: FetchedMenuCategory[]
  allItems: MenuItemWithCategoryData[]
  isLoading: boolean
  error: string | null
}

export function useProducts(): UseProductsResult {
  const [categories, setCategories] = useState<FetchedMenuCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchMenuProducts()
      .then(data => {
        if (!cancelled) {
          setCategories(data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar el menú')
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const allItems: MenuItemWithCategoryData[] = categories.flatMap(cat =>
    cat.items.map(item => ({ ...item, categoryName: cat.name, categoryId: cat.id }))
  )

  return { categories, allItems, isLoading, error }
}
