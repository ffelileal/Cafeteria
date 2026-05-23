'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { createProductAction, updateProductAction } from '../actions'
import type { ProductRow, ProductCategory } from '@/types/database'
import type { ProductFieldErrors } from '../actions'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'espresso', label: 'Espresso' },
  { value: 'filter', label: 'Filter' },
  { value: 'beans', label: 'Granos' },
  { value: 'merchandise', label: 'Merchandise' },
  { value: 'pastries', label: 'Pastelería' },
  { value: 'cold-brew', label: 'Cold Brew' },
  { value: 'special', label: 'Especial' },
]

// ── Types ─────────────────────────────────────────────────────────────────────

export type DrawerMode = 'create' | 'edit'

interface ProductValues {
  name: string
  description: string
  category: ProductCategory
  price: string
  stock: string
  popularity: string
  is_active: boolean
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

function FormLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
    >
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  )
}

function FieldInput({
  id, name, value, onChange, type = 'text', placeholder, error, min, max, step,
}: {
  id: string; name: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; error?: string
  min?: string | number; max?: string | number; step?: string | number
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={cn(
        'h-9 w-full rounded-lg border bg-muted/20 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors',
        error ? 'border-destructive/50' : 'border-border/50'
      )}
    />
  )
}

// ── Image upload zone ─────────────────────────────────────────────────────────

interface ImageUploadProps {
  preview: string | null
  onFileSelected: (file: File) => void
  onClear: () => void
}

function ImageUpload({ preview, onFileSelected, onClear }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onFileSelected(file)
  }

  return (
    <div className="relative">
      {preview ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/50">
          <Image src={preview} alt="Preview" fill className="object-cover" sizes="480px" />
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            aria-label="Quitar imagen"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 bg-muted/10 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
        >
          <svg className="h-8 w-8 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-xs">Subir imagen</span>
          <span className="text-[10px] opacity-60">JPG, PNG o WebP · máx. 5 MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}

// ── Main drawer ───────────────────────────────────────────────────────────────

interface ProductDrawerProps {
  mode: DrawerMode
  product?: ProductRow
  onClose: () => void
  onSaved: () => void
}

function buildInitialValues(product?: ProductRow): ProductValues {
  return {
    name: product?.name ?? '',
    description: product?.description ?? '',
    category: (product?.category as ProductCategory) ?? 'espresso',
    price: product ? String(product.price) : '',
    stock: product ? String(product.stock) : '0',
    popularity: product ? String(product.popularity) : '0',
    is_active: product?.is_active ?? true,
  }
}

export function ProductDrawer({ mode, product, onClose, onSaved }: ProductDrawerProps) {
  const [values, setValues] = useState<ProductValues>(() => buildInitialValues(product))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null)
  const [clearImage, setClearImage] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function set<K extends keyof ProductValues>(key: K, value: ProductValues[K]) {
    setValues(v => ({ ...v, [key]: value }))
    setFieldErrors(e => ({ ...e, [key]: undefined }))
  }

  function handleFileSelected(file: File) {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setClearImage(false)
  }

  function handleClearImage() {
    setImageFile(null)
    setImagePreview(null)
    setClearImage(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGeneralError(null)
    setFieldErrors({})

    startTransition(async () => {
      const formData = new FormData()
      formData.set('name', values.name)
      formData.set('description', values.description)
      formData.set('category', values.category)
      formData.set('price', values.price)
      formData.set('stock', values.stock)
      formData.set('popularity', values.popularity)
      formData.set('is_active', values.is_active ? 'true' : 'false')
      if (clearImage) formData.set('clear_image', 'true')
      if (imageFile) formData.set('image', imageFile)

      const result = mode === 'create'
        ? await createProductAction(formData)
        : await updateProductAction(product!.id, formData)

      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors)
        setGeneralError(result.error ?? null)
      } else if (result.error) {
        setGeneralError(result.error)
      } else {
        onSaved()
      }
    })
  }

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-border/50 bg-card p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="border-b border-border/40 px-6 py-5">
          <SheetTitle className="font-serif text-xl font-light">
            {mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          {/* Scrollable body */}
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            {/* Image */}
            <div>
              <FormLabel htmlFor="image">Imagen</FormLabel>
              <ImageUpload
                preview={imagePreview}
                onFileSelected={handleFileSelected}
                onClear={handleClearImage}
              />
            </div>

            {/* Name */}
            <div>
              <FormLabel htmlFor="name" required>Nombre</FormLabel>
              <FieldInput
                id="name" name="name"
                value={values.name}
                onChange={v => set('name', v)}
                placeholder="Ej: Flat White"
                error={fieldErrors.name}
              />
              <FieldError message={fieldErrors.name} />
            </div>

            {/* Description */}
            <div>
              <FormLabel htmlFor="description" required>Descripción</FormLabel>
              <textarea
                id="description"
                name="description"
                value={values.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Descripción del producto..."
                rows={3}
                className={cn(
                  'w-full resize-none rounded-lg border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors',
                  fieldErrors.description ? 'border-destructive/50' : 'border-border/50'
                )}
              />
              <FieldError message={fieldErrors.description} />
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="category" required>Categoría</FormLabel>
                <select
                  id="category"
                  name="category"
                  value={values.category}
                  onChange={e => set('category', e.target.value as ProductCategory)}
                  className="h-9 w-full rounded-lg border border-border/50 bg-muted/20 px-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <FieldError message={fieldErrors.category} />
              </div>

              <div>
                <FormLabel htmlFor="price" required>Precio ($)</FormLabel>
                <FieldInput
                  id="price" name="price" type="number"
                  value={values.price}
                  onChange={v => set('price', v)}
                  placeholder="0"
                  min="0" step="0.01"
                  error={fieldErrors.price}
                />
                <FieldError message={fieldErrors.price} />
              </div>
            </div>

            {/* Stock + Popularity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="stock" required>Stock</FormLabel>
                <FieldInput
                  id="stock" name="stock" type="number"
                  value={values.stock}
                  onChange={v => set('stock', v)}
                  placeholder="0"
                  min="0" step="1"
                  error={fieldErrors.stock}
                />
                <FieldError message={fieldErrors.stock} />
              </div>

              <div>
                <FormLabel htmlFor="popularity">Popularidad</FormLabel>
                <FieldInput
                  id="popularity" name="popularity" type="number"
                  value={values.popularity}
                  onChange={v => set('popularity', v)}
                  placeholder="0"
                  min="0" step="1"
                />
                <p className="mt-1 text-[10px] text-muted-foreground/60">
                  Afecta el orden en el menú
                </p>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/10 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Producto activo</p>
                <p className="text-xs text-muted-foreground">Visible en el menú público</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={values.is_active}
                onClick={() => set('is_active', !values.is_active)}
                className={cn(
                  'relative h-6 w-11 rounded-full border transition-colors duration-200',
                  values.is_active
                    ? 'border-primary/40 bg-primary/20'
                    : 'border-border bg-muted/30'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full transition-all duration-200',
                    values.is_active
                      ? 'left-[22px] bg-primary'
                      : 'left-0.5 bg-muted-foreground/40'
                  )}
                />
              </button>
            </div>

            {/* General error */}
            {generalError && !Object.keys(fieldErrors).length && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {generalError}
              </p>
            )}
          </div>

          {/* Footer */}
          <SheetFooter className="border-t border-border/40 px-6 py-4">
            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1 border border-border/50"
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isPending}
              >
                {isPending && (
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {isPending
                  ? mode === 'create' ? 'Creando...' : 'Guardando...'
                  : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
