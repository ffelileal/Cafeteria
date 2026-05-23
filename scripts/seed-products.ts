import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

type RealtimeTransport = NonNullable<NonNullable<Parameters<typeof createClient>[2]>['realtime']>['transport']
import { MENU_CATEGORIES } from '../lib/constants'
import type { ProductCategory } from '../types/database'
import type { DatabaseInsert } from '../types/database'

const CATEGORY_MAP: Record<string, ProductCategory> = {
  'cafes-calientes': 'espresso',
  'cafes-frios': 'cold-brew',
  desayunos: 'special',
  meriendas: 'pastries',
  pasteleria: 'pastries',
  'bebidas-frias': 'special',
}

function getEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

async function main() {
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      transport: ws as unknown as RealtimeTransport,
    },
  })

  console.log('\n🌱 ARTISAN — Seed Products\n')

  // Obtener productos existentes
  const { data: existingProducts, error: fetchError } = await supabase
    .from('products')
    .select('name')

  if (fetchError) {
    console.error('❌ Failed to fetch existing products:')
    console.error(fetchError.message)
    process.exit(1)
  }

  const existingNames = new Set(
    (existingProducts ?? []).map((product: { name: string }) => product.name)
  )

  console.log(`📦 Existing products: ${existingNames.size}\n`)

  const productsToInsert: DatabaseInsert<'products'>[] = []

  for (const category of MENU_CATEGORIES) {
    const mappedCategory = CATEGORY_MAP[category.id]

    if (!mappedCategory) {
      console.warn(`⚠️ Unknown category: ${category.id}`)
      continue
    }

    for (const item of category.items) {
      if (existingNames.has(item.name)) {
        console.log(`⏭ Skipping duplicate: ${item.name}`)
        continue
      }

      productsToInsert.push({
        name: item.name,
        description: item.description,
        category: mappedCategory,
        price: item.price,
        image_url: null,
        stock: 100,
        popularity: item.popularity ?? 50,
        is_active: true,
      })
    }
  }

  if (productsToInsert.length === 0) {
    console.log('\n✅ All products already exist.\n')
    return
  }

  console.log(`\n⬆️ Inserting ${productsToInsert.length} products...\n`)

  const { data: insertedProducts, error: insertError } = await supabase
    .from('products')
    .insert(productsToInsert)
    .select('name')

  if (insertError) {
    console.error('❌ Insert failed:')
    console.error(insertError.message)
    process.exit(1)
  }

  const insertedNames = (insertedProducts ?? []).map(
    (product: { name: string }) => product.name
  )

  for (const name of insertedNames) {
    console.log(`✅ Inserted: ${name}`)
  }

  console.log(`\n🎉 Done! Inserted ${insertedNames.length} products.\n`)
}

main().catch((error: unknown) => {
  console.error('\n❌ Unexpected error:\n')
  console.error(error)
  process.exit(1)
})