import { getOrders } from '@/lib/admin/queries'
import { OrdersFilters } from './_components/orders-filters'
import { OrdersDataTable } from './_components/orders-data-table'
import type { OrderStatus, OrderType } from '@/types/database'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function str(val: string | string[] | undefined): string {
  return Array.isArray(val) ? (val[0] ?? '') : (val ?? '')
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = (str(params.status) || 'all') as OrderStatus | 'all'
  const orderType = (str(params.type) || 'all') as OrderType | 'all'
  const search = str(params.q)
  const page = Math.max(1, Number(str(params.page)) || 1)

  const { orders, total, pages } = await getOrders({ status, orderType, search, page })

  const isFiltered = status !== 'all' || orderType !== 'all' || !!search

  return (
    <div className="px-6 py-8 lg:px-8 xl:px-10">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground">Pedidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total}{' '}
            {total === 1 ? 'pedido' : 'pedidos'}
            {isFiltered ? ' encontrados' : ' en total'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <OrdersFilters
        currentStatus={status}
        currentType={orderType}
        currentSearch={search}
      />

      {/* Table */}
      <div className="mt-6">
        <OrdersDataTable orders={orders} total={total} page={page} pages={pages} />
      </div>

    </div>
  )
}
