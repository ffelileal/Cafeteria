'use client'

import { useTransition, useState } from 'react'
import { cn } from '@/lib/utils'
import { updateTableStatusAction, updateTableReservationStatusAction } from '@/app/admin/actions'
import type { AdminTableView, AdminTableReservation } from '@/lib/admin/queries'
import type { TableStatus, TableReservationStatus } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<TableStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservada',
  occupied: 'Ocupada',
}

const STATUS_CARD: Record<TableStatus, string> = {
  available: 'border-emerald-500/20 bg-emerald-500/5',
  reserved:  'border-amber-500/20  bg-amber-500/5',
  occupied:  'border-red-500/20    bg-red-500/5',
}

const STATUS_DOT: Record<TableStatus, string> = {
  available: 'bg-emerald-400',
  reserved:  'bg-amber-400',
  occupied:  'bg-red-400',
}

const STATUS_TEXT: Record<TableStatus, string> = {
  available: 'text-emerald-400',
  reserved:  'text-amber-400',
  occupied:  'text-red-400',
}

const ALL_STATUSES: TableStatus[] = ['available', 'reserved', 'occupied']

const RES_STATUS_LABEL: Record<TableReservationStatus, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

const RES_STATUS_STYLES: Record<TableReservationStatus, string> = {
  pending:   'bg-amber-500/10  text-amber-400  border-amber-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10   text-red-400    border-red-500/20',
  completed: 'bg-muted/60     text-muted-foreground border-border',
}

const ALL_RES_STATUSES: TableReservationStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

const SECTOR_COLORS: Record<string, string> = {
  Terraza:  'bg-sky-500/10 text-sky-400',
  Interior: 'bg-violet-500/10 text-violet-400',
  Ventana:  'bg-teal-500/10 text-teal-400',
  VIP:      'bg-primary/10 text-primary',
}

// ── Status select (table) ─────────────────────────────────────────────────────

function TableStatusSelect({ table }: { table: AdminTableView }) {
  const [isPending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useState<TableStatus>(table.status)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as TableStatus
    if (next === optimistic) return
    setOptimistic(next)
    startTransition(async () => {
      const res = await updateTableStatusAction(table.id, next)
      if (res.error) setOptimistic(table.status) // revert on error
    })
  }

  return (
    <div className="relative inline-block">
      <span className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-opacity',
        STATUS_TEXT[optimistic],
        isPending && 'opacity-50'
      )}>
        <span className={cn('h-1.5 w-1.5 rounded-full', isPending ? 'animate-pulse bg-current' : STATUS_DOT[optimistic])} />
        {STATUS_LABEL[optimistic]}
      </span>
      <select
        value={optimistic}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Cambiar estado"
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      >
        {ALL_STATUSES.map(s => (
          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
        ))}
      </select>
    </div>
  )
}

// ── Reservation status select ─────────────────────────────────────────────────

function ResStatusSelect({ id, current }: { id: string; current: TableReservationStatus }) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as TableReservationStatus
    if (next === current) return
    startTransition(async () => { await updateTableReservationStatusAction(id, next) })
  }

  return (
    <div className="relative inline-block">
      <span className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-opacity',
        RES_STATUS_STYLES[current],
        isPending && 'opacity-50'
      )}>
        {isPending && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
        {RES_STATUS_LABEL[current]}
      </span>
      <select
        value={current}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Cambiar estado reserva"
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      >
        {ALL_RES_STATUSES.map(s => (
          <option key={s} value={s}>{RES_STATUS_LABEL[s]}</option>
        ))}
      </select>
    </div>
  )
}

// ── Reservations dialog ───────────────────────────────────────────────────────

function ReservationsDialog({
  table,
  reservations,
  open,
  onClose,
}: {
  table: AdminTableView
  reservations: AdminTableReservation[]
  open: boolean
  onClose: () => void
}) {
  function fmtDate(iso: string) {
    const d = new Date(iso)
    return {
      date: d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }),
      time: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg font-light text-foreground">
            {table.name} — Reservas
          </DialogTitle>
        </DialogHeader>

        {reservations.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay reservas para esta mesa.
          </p>
        ) : (
          <ul className="max-h-[60vh] divide-y divide-border/30 overflow-y-auto">
            {reservations.map(r => {
              const { date, time } = fmtDate(r.reservation_date)
              return (
                <li key={r.id} className="py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{r.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{r.customer_phone} · {r.customer_email}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground" suppressHydrationWarning>
                        {date} · {time} · {r.people_count} persona{r.people_count !== 1 ? 's' : ''}
                      </p>
                      {r.notes && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground/60 italic">{r.notes}</p>
                      )}
                    </div>
                    <ResStatusSelect id={r.id} current={r.status} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Table card ────────────────────────────────────────────────────────────────

function TableCard({
  table,
  onViewReservations,
}: {
  table: AdminTableView
  onViewReservations: (table: AdminTableView) => void
}) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className={cn(
      'rounded-2xl border p-5 transition-colors',
      STATUS_CARD[table.status]
    )}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-serif text-2xl font-light text-foreground">{table.table_number}</p>
          <p className="text-xs text-muted-foreground">{table.name}</p>
        </div>
        <TableStatusSelect table={table} />
      </div>

      {/* Info */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={cn(
          'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
          SECTOR_COLORS[table.sector] ?? 'bg-muted/40 text-muted-foreground'
        )}>
          {table.sector}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {table.capacity} persona{table.capacity !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Reservas del día */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Reservas hoy</span>
        <span className={cn(
          'font-medium',
          table.today_reservations > 0 ? 'text-foreground' : 'text-muted-foreground/50'
        )}>
          {table.today_reservations}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-border/30 pt-3">
        <button
          onClick={() => onViewReservations(table)}
          className="flex-1 rounded-lg border border-border/50 bg-card/40 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          Ver reservas
        </button>
        <a
          href={`${baseUrl}/mesa/${table.qr_slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border/50 bg-card/40 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          title="Abrir página de mesa"
        >
          QR ↗
        </a>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

interface TablesGridProps {
  tables: AdminTableView[]
  reservationsByTable: Record<string, AdminTableReservation[]>
}

export function TablesGrid({ tables, reservationsByTable }: TablesGridProps) {
  const [selectedTable, setSelectedTable] = useState<AdminTableView | null>(null)

  const available = tables.filter(t => t.status === 'available').length
  const reserved  = tables.filter(t => t.status === 'reserved').length
  const occupied  = tables.filter(t => t.status === 'occupied').length

  return (
    <>
      {/* Summary strip */}
      <div className="mb-6 flex flex-wrap gap-4">
        {([
          { label: 'Disponibles', count: available, color: 'text-emerald-400' },
          { label: 'Reservadas',  count: reserved,  color: 'text-amber-400' },
          { label: 'Ocupadas',    count: occupied,   color: 'text-red-400' },
        ] as const).map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={cn('text-lg font-serif font-light', color)}>{count}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {tables.map(table => (
          <TableCard
            key={table.id}
            table={table}
            onViewReservations={setSelectedTable}
          />
        ))}
      </div>

      {/* Reservations dialog */}
      {selectedTable && (
        <ReservationsDialog
          table={selectedTable}
          reservations={reservationsByTable[selectedTable.id] ?? []}
          open={!!selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </>
  )
}
