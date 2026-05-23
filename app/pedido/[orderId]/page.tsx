import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { OrderTracker } from './_components/order-tracker'
import type { OrderStatus } from '@/types/database'

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function PedidoPage({ params }: Props) {
  const { orderId } = await params

  const { data } = await supabaseAdmin
    .from('orders')
    .select(
      'id, status, total, notes, created_at, table_number, table_slug, order_items(id, quantity, unit_price, subtotal, products(name))'
    )
    .eq('id', orderId)
    .single()

  if (!data) notFound()

  type RawProduct = { name: string }
  type RawItem = {
    id: string
    quantity: number
    unit_price: number
    subtotal: number
    products: RawProduct | RawProduct[] | null
  }
  type RawOrder = {
    id: string
    status: string
    total: number
    notes: string | null
    created_at: string
    table_number: number | null
    table_slug: string | null
    order_items: RawItem[] | null
  }

  const raw = data as RawOrder

  const order = {
    id: raw.id,
    status: raw.status as OrderStatus,
    total: Number(raw.total),
    notes: raw.notes,
    created_at: raw.created_at,
    table_number: raw.table_number,
    table_slug: raw.table_slug,
    items: (raw.order_items ?? []).map(item => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      return {
        id: item.id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        subtotal: Number(item.subtotal),
        product_name: product?.name ?? null,
      }
    }),
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/20 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link
            href="/menu"
            className="font-serif text-xl font-light tracking-[0.2em] text-foreground"
          >
            ARTISAN
          </Link>
          <Link
            href="/menu"
            className="rounded-full border border-foreground/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground transition hover:border-primary hover:text-primary"
          >
            Menú
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <OrderTracker order={order} />
      </div>
    </main>
  )
}
