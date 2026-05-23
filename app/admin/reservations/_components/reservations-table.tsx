'use client'

import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { updateReservationStatusAction } from '@/app/admin/actions'
import type { ReservationDetail } from '@/lib/admin/queries'
import type { ReservationStatus } from '@/types/database'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  completed: 'bg-muted/60 text-muted-foreground border-border',
}

const ALL_STATUSES: ReservationStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatReservationDate(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  }
}

function isPast(iso: string) {
  return new Date(iso) < new Date()
}

// ── Status select ─────────────────────────────────────────────────────────────

function StatusSelect({ id, current }: { id: string; current: ReservationStatus }) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ReservationStatus
    if (next === current) return
    startTransition(async () => { await updateReservationStatusAction(id, next) })
  }

  return (
    <div className="relative inline-block">
      <span className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-opacity',
        STATUS_STYLES[current],
        isPending && 'opacity-50'
      )}>
        {isPending && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
        {STATUS_LABELS[current]}
      </span>
      <select
        value={current}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Cambiar estado"
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      >
        {ALL_STATUSES.map(s => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
    </div>
  )
}

// ── Table row ─────────────────────────────────────────────────────────────────

function ReservationRow({ r }: { r: ReservationDetail }) {
  const { date, time } = formatReservationDate(r.reservation_date)
  const past = isPast(r.reservation_date)

  return (
    <tr className="group transition-colors hover:bg-muted/20">
      {/* Fecha */}
      <td className="px-4 py-3" suppressHydrationWarning>
        <p className={cn('text-sm font-medium', past && r.status === 'pending' ? 'text-amber-400' : 'text-foreground')}>
          {date}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </td>

      {/* Cliente */}
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">{r.customer?.full_name ?? '—'}</p>
        {r.customer?.email && (
          <p className="text-xs text-muted-foreground">{r.customer.email}</p>
        )}
      </td>

      {/* Personas */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted/30 text-sm font-medium text-foreground">
          {r.party_size}
        </span>
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <StatusSelect id={r.id} current={r.status} />
      </td>

      {/* Notas */}
      <td className="px-4 py-3 max-w-xs">
        {r.notes ? (
          <p className="truncate text-xs text-muted-foreground" title={r.notes}>{r.notes}</p>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Solicitado */}
      <td className="px-4 py-3 text-xs text-muted-foreground" suppressHydrationWarning>
        {new Date(r.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
      </td>
    </tr>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

const HEADERS = ['Fecha y hora', 'Cliente', 'Personas', 'Estado', 'Notas', 'Solicitado']

export function ReservationsTable({ reservations }: { reservations: ReservationDetail[] }) {
  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/40 py-20">
        <p className="text-sm text-muted-foreground">No se encontraron reservas.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20">
              {HEADERS.map(h => (
                <th key={h} className={cn(
                  'px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground',
                  h === 'Personas' && 'text-center'
                )}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {reservations.map(r => <ReservationRow key={r.id} r={r} />)}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border/40 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {reservations.length} reserva{reservations.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
