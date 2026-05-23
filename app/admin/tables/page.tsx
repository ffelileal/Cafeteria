import { getAdminTables, getTableReservationsForAdmin } from '@/lib/admin/queries'
import { TablesGrid } from './_components/tables-grid'
import { RealtimeRefresher } from '../_components/realtime-refresher'
import type { AdminTableReservation } from '@/lib/admin/queries'

export default async function TablesPage() {
  const tables = await getAdminTables()

  // Fetch reservations for all tables in parallel
  const reservationResults = await Promise.all(
    tables.map(t => getTableReservationsForAdmin(t.id))
  )

  const reservationsByTable: Record<string, AdminTableReservation[]> = {}
  tables.forEach((t, i) => {
    reservationsByTable[t.id] = reservationResults[i]
  })

  const totalToday = tables.reduce((s, t) => s + t.today_reservations, 0)

  return (
    <div className="px-6 py-8 lg:px-8 xl:px-10">
      <RealtimeRefresher tables={['tables', 'table_reservations']} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-light text-foreground">Mesas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tables.length} mesas · {totalToday} reserva{totalToday !== 1 ? 's' : ''} hoy
        </p>
      </div>

      <TablesGrid tables={tables} reservationsByTable={reservationsByTable} />
    </div>
  )
}
