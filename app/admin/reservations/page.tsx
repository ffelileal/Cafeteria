import { getAdminReservations } from '@/lib/admin/queries'
import { ReservationsFilters } from './_components/reservations-filters'
import { ReservationsTable } from './_components/reservations-table'
import type { ReservationStatus } from '@/types/database'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function str(val: string | string[] | undefined): string {
  return Array.isArray(val) ? (val[0] ?? '') : (val ?? '')
}

export default async function ReservationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = (str(params.status) || 'all') as ReservationStatus | 'all'
  const search = str(params.q)

  const reservations = await getAdminReservations({ status, search })

  const isFiltered = status !== 'all' || !!search

  return (
    <div className="px-6 py-8 lg:px-8 xl:px-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-light text-foreground">Reservas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {reservations.length} reserva{reservations.length !== 1 ? 's' : ''}
          {isFiltered ? ' encontradas' : ' en total'}
        </p>
      </div>

      {/* Filters */}
      <ReservationsFilters currentStatus={status} currentSearch={search} />

      {/* Table */}
      <div className="mt-6">
        <ReservationsTable reservations={reservations} />
      </div>
    </div>
  )
}
