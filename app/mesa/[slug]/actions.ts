'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'

const schema = z.object({
  table_id:         z.string().uuid('Mesa inválida'),
  qr_slug:          z.string().min(1),
  customer_name:    z.string().min(2, 'Nombre requerido (mín. 2 caracteres)'),
  customer_phone:   z.string().min(6, 'Teléfono requerido (mín. 6 dígitos)'),
  customer_email:   z.string().email('Email inválido'),
  reservation_date: z.string().refine(
    v => new Date(v) > new Date(),
    'La fecha y hora deben ser futuras'
  ),
  people_count: z.coerce.number().int().min(1, 'Mínimo 1 persona'),
  capacity:     z.coerce.number().int(),
  notes:        z.string().optional(),
})

export interface TableReservationActionState {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

export async function createTableReservationAction(
  _prev: TableReservationActionState,
  formData: FormData
): Promise<TableReservationActionState> {
  const raw = {
    table_id:         formData.get('table_id'),
    qr_slug:          formData.get('qr_slug'),
    customer_name:    formData.get('customer_name'),
    customer_phone:   formData.get('customer_phone'),
    customer_email:   formData.get('customer_email'),
    reservation_date: formData.get('reservation_date'),
    people_count:     formData.get('people_count'),
    capacity:         formData.get('capacity'),
    notes:            formData.get('notes'),
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[k] = msgs[0] ?? 'Campo inválido'
    }
    return { fieldErrors }
  }

  const d = parsed.data

  if (d.people_count > d.capacity) {
    return {
      fieldErrors: {
        people_count: `Esta mesa tiene capacidad máxima de ${d.capacity} personas`,
      },
    }
  }

  const { error } = await supabaseAdmin.from('table_reservations').insert({
    table_id:         d.table_id,
    customer_name:    d.customer_name,
    customer_phone:   d.customer_phone,
    customer_email:   d.customer_email,
    reservation_date: d.reservation_date,
    people_count:     d.people_count,
    notes:            d.notes ?? null,
    status:           'pending',
  })

  if (error) {
    return { error: 'No se pudo crear la reserva. Intentá nuevamente.' }
  }

  revalidatePath(`/mesa/${d.qr_slug}`)
  revalidatePath('/admin/tables')

  return { success: true }
}
