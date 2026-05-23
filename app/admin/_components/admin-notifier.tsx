'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browser'
import { useOrdersNotification } from './orders-notification-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

type PGEvent = Parameters<RealtimeChannel['on']>[0]

type NewOrderPayload = {
  id: string
  total: number
  table_number: number | null
  table_slug: string | null
}

export function AdminNotifier() {
  const { addNewOrder } = useOrdersNotification()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('admin-notifier-orders')
      .on(
        'postgres_changes' as PGEvent,
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new as NewOrderPayload

          addNewOrder()

          const mesaLabel = order.table_number != null
            ? `Mesa ${order.table_number}`
            : null

          toast.info(mesaLabel ? `Nuevo pedido · ${mesaLabel}` : 'Nuevo pedido', {
            description: `$${Number(order.total).toLocaleString('es-AR')}`,
            duration: 8000,
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [addNewOrder])

  return null
}
