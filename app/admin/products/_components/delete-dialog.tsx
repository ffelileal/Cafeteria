'use client'

import { useTransition } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteProductAction } from '../actions'
import type { ProductRow } from '@/types/database'

interface DeleteDialogProps {
  product: ProductRow
  onCancel: () => void
  onDeleted: () => void
}

export function DeleteDialog({ product, onCancel, onDeleted }: DeleteDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProductAction(product.id)
      if (!result.error) onDeleted()
    })
  }

  return (
    <AlertDialog open onOpenChange={open => { if (!open) onCancel() }}>
      <AlertDialogContent className="border-border/50 bg-card sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl font-light">
            Eliminar producto
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            ¿Seguro que querés eliminar{' '}
            <span className="font-medium text-foreground">{product.name}</span>?
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            onClick={onCancel}
            className="border-border/50 bg-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
          >
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && (
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
