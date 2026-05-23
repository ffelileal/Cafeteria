/**
 * Creates the 15 cafeteria tables in Supabase.
 * Safe to re-run — uses upsert on qr_slug (unique).
 *
 * Usage: pnpm seed:tables
 */

import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  realtime: { transport: ws as unknown as typeof WebSocket },
})

// ── Table definitions ─────────────────────────────────────────────────────────
// Distribution: 5 × 2-person | 6 × 4-person | 4 × 6-person = 15 tables

const TABLES = [
  // 2-person tables (5)
  { table_number: 1,  name: 'Mesa 01', capacity: 2, sector: 'Interior', qr_slug: 'interior-01' },
  { table_number: 2,  name: 'Mesa 02', capacity: 2, sector: 'Interior', qr_slug: 'interior-02' },
  { table_number: 3,  name: 'Mesa 03', capacity: 2, sector: 'Ventana',  qr_slug: 'ventana-01' },
  { table_number: 4,  name: 'Mesa 04', capacity: 2, sector: 'Terraza',  qr_slug: 'terraza-01' },
  { table_number: 5,  name: 'Mesa 05', capacity: 2, sector: 'Terraza',  qr_slug: 'terraza-02' },

  // 4-person tables (6)
  { table_number: 6,  name: 'Mesa 06', capacity: 4, sector: 'Interior', qr_slug: 'interior-03' },
  { table_number: 7,  name: 'Mesa 07', capacity: 4, sector: 'Interior', qr_slug: 'interior-04' },
  { table_number: 8,  name: 'Mesa 08', capacity: 4, sector: 'Interior', qr_slug: 'interior-05' },
  { table_number: 9,  name: 'Mesa 09', capacity: 4, sector: 'Ventana',  qr_slug: 'ventana-02' },
  { table_number: 10, name: 'Mesa 10', capacity: 4, sector: 'Ventana',  qr_slug: 'ventana-03' },
  { table_number: 11, name: 'Mesa 11', capacity: 4, sector: 'Terraza',  qr_slug: 'terraza-03' },

  // 6-person tables (4)
  { table_number: 12, name: 'Mesa 12', capacity: 6, sector: 'VIP',      qr_slug: 'vip-01' },
  { table_number: 13, name: 'Mesa 13', capacity: 6, sector: 'VIP',      qr_slug: 'vip-02' },
  { table_number: 14, name: 'Mesa 14', capacity: 6, sector: 'Terraza',  qr_slug: 'terraza-04' },
  { table_number: 15, name: 'Mesa 15', capacity: 6, sector: 'Terraza',  qr_slug: 'terraza-05' },
] as const

async function main() {
  console.log('🪑  Seeding tables…')

  const rows = TABLES.map(t => ({ ...t, status: 'available' as const }))

  const { data, error } = await supabase
    .from('tables')
    .upsert(rows, { onConflict: 'qr_slug', ignoreDuplicates: false })
    .select('table_number, name, sector, capacity, qr_slug')

  if (error) {
    console.error('❌  Error:', error.message)
    process.exit(1)
  }

  console.log(`✅  ${data?.length ?? 0} tables upserted`)
  console.log()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  for (const row of data ?? []) {
    const typedRow = row as typeof TABLES[number] & { status: string }
    console.log(
      `  [${String(typedRow.table_number).padStart(2, '0')}] ${typedRow.name.padEnd(8)}` +
      `  ${typedRow.sector.padEnd(8)}` +
      `  ${typedRow.capacity}p` +
      `  ${baseUrl}/mesa/${typedRow.qr_slug}`
    )
  }
}

main()
