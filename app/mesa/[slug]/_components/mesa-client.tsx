'use client'

import { useState } from 'react'
import { ReservationDialog } from './reservation-dialog'
import type { TableRow } from '@/types/database'

interface MesaClientProps {
  table: TableRow
  canReserve: boolean
}

export function MesaClient({ table, canReserve }: MesaClientProps) {
  const [open, setOpen] = useState(false)

  if (!canReserve) {
    return (
      <p className="rounded-2xl border border-border/50 bg-card/40 px-6 py-4 text-center text-sm text-muted-foreground">
        Esta mesa no está disponible en este momento.
      </p>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-primary/30 bg-primary/10 px-6 py-4 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
      >
        Reservar mesa
      </button>

      <ReservationDialog
        table={table}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
