'use client'

import { useActionState, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { createTableReservationAction } from '../actions'
import type { TableReservationActionState } from '../actions'
import type { TableRow } from '@/types/database'

// ── Helpers ───────────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-[11px] text-red-400">{msg}</p>
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
      {children}
    </label>
  )
}

const inputCls =
  'mt-1.5 w-full rounded-xl border border-border/50 bg-card/40 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors'

function minDateTime() {
  // datetime-local minimum: now + 15 minutes, rounded to next 15-min slot
  const now = new Date(Date.now() + 15 * 60 * 1000)
  now.setSeconds(0, 0)
  const mins = now.getMinutes()
  const rounded = Math.ceil(mins / 15) * 15
  now.setMinutes(rounded)
  return now.toISOString().slice(0, 16)
}

// ── Form ──────────────────────────────────────────────────────────────────────

const initialState: TableReservationActionState = {}

function ReservationForm({
  table,
  onSuccess,
}: {
  table: TableRow
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    createTableReservationAction,
    initialState
  )

  if (state.success) {
    return (
      <div className="py-8 text-center">
        <p className="text-3xl">✓</p>
        <p className="mt-3 font-serif text-lg font-light text-foreground">
          ¡Reserva solicitada!
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Te confirmamos por email a la brevedad.
        </p>
        <button
          onClick={onSuccess}
          className="mt-6 rounded-xl border border-border/50 px-6 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Cerrar
        </button>
      </div>
    )
  }

  const fe = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden fields */}
      <input type="hidden" name="table_id" value={table.id} />
      <input type="hidden" name="qr_slug" value={table.qr_slug} />
      <input type="hidden" name="capacity" value={table.capacity} />

      {state.error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Nombre *</Label>
          <input name="customer_name" placeholder="Tu nombre" className={inputCls} required />
          <FieldError msg={fe.customer_name} />
        </div>
        <div>
          <Label>Teléfono *</Label>
          <input name="customer_phone" type="tel" placeholder="+54 9 11 1234-5678" className={inputCls} required />
          <FieldError msg={fe.customer_phone} />
        </div>
      </div>

      <div>
        <Label>Email *</Label>
        <input name="customer_email" type="email" placeholder="tu@email.com" className={inputCls} required />
        <FieldError msg={fe.customer_email} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Fecha y hora *</Label>
          <input
            name="reservation_date"
            type="datetime-local"
            min={minDateTime()}
            className={inputCls}
            required
          />
          <FieldError msg={fe.reservation_date} />
        </div>
        <div>
          <Label>Personas * (máx. {table.capacity})</Label>
          <input
            name="people_count"
            type="number"
            min={1}
            max={table.capacity}
            placeholder="2"
            className={inputCls}
            required
          />
          <FieldError msg={fe.people_count} />
        </div>
      </div>

      <div>
        <Label>Notas (opcional)</Label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Alergias, ocasión especial…"
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Enviando…' : 'Confirmar reserva'}
      </button>
    </form>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

interface ReservationDialogProps {
  table: TableRow
  open: boolean
  onClose: () => void
}

export function ReservationDialog({ table, open, onClose }: ReservationDialogProps) {
  const [key, setKey] = useState(0)

  function handleSuccess() {
    onClose()
    setKey(k => k + 1) // reset form on next open
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-light text-foreground">
            Reservar {table.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {table.sector} · Capacidad {table.capacity} personas
          </DialogDescription>
        </DialogHeader>
        <ReservationForm key={key} table={table} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
