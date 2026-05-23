import { supabaseClient } from '@/lib/supabase/client'
import type { ProductRow, ProductCategory } from '@/types/database'

// Extends ProductRow with optional UI-only fields.
// These are never stored in the DB; they remain undefined at runtime
// but allow the menu UI to reference them without TS errors.
export interface MenuProduct extends ProductRow {
  size?: string
  intensity?: number
  hot?: boolean
  cold?: boolean
  time?: string
  serves?: number
  featured?: boolean
  tags?: string[]
}

export interface FetchedMenuCategory {
  id: string
  name: string
  description: string
  items: MenuProduct[]
}

const CATEGORY_META: Record<ProductCategory, { name: string; description: string }> = {
  espresso: {
    name: 'Cafés Calientes',
    description: 'Especialidades preparadas con granos seleccionados y tostado artesanal.',
  },
  'cold-brew': {
    name: 'Cafés Fríos',
    description: 'Preparaciones frías para disfrutar en cualquier estación.',
  },
  pastries: {
    name: 'Pastelería & Meriendas',
    description: 'Pastelería artesanal horneada diariamente en nuestra cocina.',
  },
  special: {
    name: 'Desayunos & Bebidas',
    description: 'Opciones clásicas y premium para arrancar el día con energía.',
  },
  filter: {
    name: 'Filter Coffee',
    description: 'Pour-over, aeropress y métodos de filtro para los puristas.',
  },
  beans: {
    name: 'Granos & Bolsas',
    description: 'Nuestros granos seleccionados para llevar a casa.',
  },
  merchandise: {
    name: 'Merchandise',
    description: 'Llevá un pedazo de ARTISAN a tu hogar.',
  },
}

const CATEGORY_ORDER: ProductCategory[] = [
  'espresso',
  'cold-brew',
  'filter',
  'pastries',
  'special',
  'beans',
  'merchandise',
]

export async function fetchMenuProducts(): Promise<FetchedMenuCategory[]> {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('popularity', { ascending: false })

  if (error) throw new Error(error.message)

  const products = (data ?? []) as MenuProduct[]

  const grouped = new Map<ProductCategory, MenuProduct[]>()
  for (const product of products) {
    const cat = product.category
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(product)
  }

  return CATEGORY_ORDER.filter(cat => grouped.has(cat)).map(cat => ({
    id: cat,
    name: CATEGORY_META[cat].name,
    description: CATEGORY_META[cat].description,
    items: grouped.get(cat)!,
  }))
}
