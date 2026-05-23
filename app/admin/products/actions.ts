'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProductCategory } from '@/types/database'

// ── Constants ─────────────────────────────────────────────────────────────────

const PRODUCT_CATEGORIES: [ProductCategory, ...ProductCategory[]] = [
  'espresso', 'filter', 'beans', 'merchandise', 'pastries', 'cold-brew', 'special',
]

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

// ── Validation ────────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().min(1, 'La descripción es requerida').max(500),
  category: z.enum(PRODUCT_CATEGORIES, {
    errorMap: () => ({ message: 'Categoría inválida' }),
  }),
  price: z.coerce.number().min(0, 'El precio debe ser positivo'),
  stock: z.coerce.number().int().min(0, 'El stock debe ser 0 o más'),
  popularity: z.coerce.number().int().min(0).default(0),
})

export type ProductFieldErrors = Partial<Record<keyof z.infer<typeof productSchema>, string>>

export interface ProductActionResult {
  error?: string
  fieldErrors?: ProductFieldErrors
}

// ── Auth guard ────────────────────────────────────────────────────────────────

async function assertAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

// ── Image upload ──────────────────────────────────────────────────────────────

async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Formato de imagen no permitido. Usá JPG, PNG o WebP.')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('La imagen no puede superar los 5 MB.')
  }

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const path = `${crypto.randomUUID()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false })

  if (error) throw new Error('Error al subir la imagen. Verificá que el bucket "product-images" exista en Supabase Storage.')

  const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseFormData(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    category: formData.get('category'),
    price: formData.get('price'),
    stock: formData.get('stock'),
    popularity: formData.get('popularity') || '0',
  })
}

function extractFieldErrors(error: z.ZodError): ProductFieldErrors {
  const fieldErrors: ProductFieldErrors = {}
  for (const [key, issues] of Object.entries(error.flatten().fieldErrors)) {
    const k = key as keyof ProductFieldErrors
    if (issues?.[0]) fieldErrors[k] = issues[0]
  }
  return fieldErrors
}

function revalidate() {
  revalidatePath('/admin/products')
  revalidatePath('/admin/dashboard')
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createProductAction(formData: FormData): Promise<ProductActionResult> {
  if (!await assertAdmin()) return { error: 'No autorizado' }

  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return { error: 'Datos inválidos', fieldErrors: extractFieldErrors(parsed.error) }
  }

  let imageUrl: string | null = null
  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadImage(imageFile)
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Error al subir la imagen' }
    }
  }

  const { error } = await supabaseAdmin.from('products').insert({
    ...parsed.data,
    image_url: imageUrl,
    is_active: formData.get('is_active') === 'true',
  })

  if (error) return { error: 'No se pudo crear el producto' }

  revalidate()
  return {}
}

export async function updateProductAction(id: string, formData: FormData): Promise<ProductActionResult> {
  if (!await assertAdmin()) return { error: 'No autorizado' }

  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return { error: 'Datos inválidos', fieldErrors: extractFieldErrors(parsed.error) }
  }

  const updates: Record<string, unknown> = {
    ...parsed.data,
    is_active: formData.get('is_active') === 'true',
  }

  const imageFile = formData.get('image') as File | null
  const clearImage = formData.get('clear_image') === 'true'

  if (imageFile && imageFile.size > 0) {
    try {
      updates.image_url = await uploadImage(imageFile)
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Error al subir la imagen' }
    }
  } else if (clearImage) {
    updates.image_url = null
  }

  const { error } = await supabaseAdmin.from('products').update(updates).eq('id', id)
  if (error) return { error: 'No se pudo actualizar el producto' }

  revalidate()
  return {}
}

export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  if (!await assertAdmin()) return { error: 'No autorizado' }

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  if (error) return { error: 'No se pudo eliminar. El producto puede tener pedidos asociados.' }

  revalidate()
  return {}
}

export async function toggleProductActiveAction(
  id: string,
  isActive: boolean,
): Promise<ProductActionResult> {
  if (!await assertAdmin()) return { error: 'No autorizado' }

  const { error } = await supabaseAdmin
    .from('products')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { error: 'No se pudo actualizar el producto' }

  revalidate()
  return {}
}
