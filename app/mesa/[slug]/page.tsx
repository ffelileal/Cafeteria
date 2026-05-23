import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTableBySlug } from '@/lib/repositories/tables.repository'
import { MesaClient } from './_components/mesa-client'
import { cn } from '@/lib/utils'
import type { TableStatus } from '@/types/database'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<TableStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservada',
  occupied: 'Ocupada',
}

const STATUS_STYLES: Record<TableStatus, string> = {
  available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  reserved:  'bg-amber-500/10  text-amber-400  border-amber-500/20',
  occupied:  'bg-red-500/10    text-red-400    border-red-500/20',
}

// ── Info card ─────────────────────────────────────────────────────────────────

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 px-5 py-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-xl font-light text-foreground">{value}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function MesaPage({ params }: PageProps) {
  const { slug } = await params
  const table = await getTableBySlug(slug)

  if (!table) notFound()

  const canReserve = table.status === 'available'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-8 text-center">
          <p className="font-serif text-2xl font-light tracking-[0.3em] text-foreground">
            ARTISAN
          </p>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            Cafetería
          </p>
        </div>

        {/* Table name + status */}
        <div className="mb-6 text-center">
          <h1 className="font-serif text-4xl font-light text-foreground">{table.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{table.sector}</p>
          <span className={cn(
            'mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider',
            STATUS_STYLES[table.status]
          )}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {STATUS_LABEL[table.status]}
          </span>
        </div>

        {/* Info cards */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <InfoCard label="Capacidad" value={`${table.capacity} personas`} />
          <InfoCard label="Sector" value={table.sector} />
        </div>

        {/* Actions — interactive, client component */}
        <MesaClient table={table} canReserve={canReserve} />

        {/* Separator */}
        <div className="my-6 h-px bg-border/40" />

        {/* Ver menú */}
        <Link
          href="/menu"
          className="flex w-full items-center justify-center rounded-2xl border border-border/50 bg-card/40 px-6 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          Ver menú
        </Link>

        {/* Footer */}
        <p className="mt-8 text-center text-[11px] text-muted-foreground/40">
          Mesa #{table.table_number} · {table.qr_slug}
        </p>
      </div>
    </div>
  )
}
