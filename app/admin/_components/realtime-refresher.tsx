'use client'

import { useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

type WatchedTable = 'orders' | 'reservations' | 'tables' | 'table_reservations'

interface RealtimeRefresherProps {
  tables: WatchedTable[]
  // debounce in ms — avoids thrashing on rapid consecutive changes
  debounceMs?: number
}

export function RealtimeRefresher({
  tables,
  debounceMs = 900,
}: RealtimeRefresherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const tablesKey = tables.join(',')

  useEffect(() => {
    const supabase = createClient()

    const scheduleRefresh = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        startTransition(() => router.refresh())
      }, debounceMs)
    }

    const channel = supabase.channel(`admin-rt-${tablesKey}`)

    tables.forEach(table => {
      channel.on(
        'postgres_changes' as Parameters<typeof channel.on>[0],
        { event: '*', schema: 'public', table },
        scheduleRefresh,
      )
    })

    channel.subscribe()

    return () => {
      clearTimeout(timerRef.current)
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablesKey, debounceMs])

  return (
    <div
      aria-live="polite"
      className={[
        'fixed bottom-5 right-5 z-50 flex items-center gap-2',
        'rounded-full border border-border/60 bg-card/90 px-4 py-2',
        'text-[11px] text-muted-foreground shadow-xl backdrop-blur-md',
        'transition-all duration-300',
        isPending ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      ].join(' ')}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
      Actualizando datos…
    </div>
  )
}
