'use client'

import { useActionState } from 'react'
import { cn } from '@/lib/utils'
import { loginAction, type AuthActionState } from '@/app/admin/actions'

const initial: AuthActionState = {}

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

import { useState } from 'react'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initial)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          className={inputClass}
          placeholder="admin@artisan.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            disabled={isPending}
            className={cn(inputClass, 'pr-10')}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword
              ? <EyeOffIcon className="h-4 w-4" />
              : <EyeIcon className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      {state.error && (
        <p className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-xs text-destructive">
          <span className="h-1 w-1 rounded-full bg-destructive" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium tracking-wide',
          'bg-primary text-primary-foreground transition-all duration-200',
          'hover:opacity-90 active:scale-[0.98]',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        {isPending ? (
          <>
            <SpinnerIcon className="h-4 w-4" />
            Verificando...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </button>
    </form>
  )
}

const inputClass = cn(
  'w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-sm text-foreground',
  'placeholder:text-muted-foreground/40 backdrop-blur-sm',
  'transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30',
  'disabled:cursor-not-allowed disabled:opacity-50'
)

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
