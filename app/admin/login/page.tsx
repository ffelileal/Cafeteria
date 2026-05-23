import { LoginForm } from './_components/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      {/* Background texture */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--color-primary-rgb,180,120,60),0.06),transparent_60%)]" />

      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl font-light tracking-[0.25em] text-foreground">
            ARTISAN
          </h1>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Panel administrativo
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card/40 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="font-serif text-xl font-light text-foreground">
              Bienvenido
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ingresá tus credenciales para continuar.
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground/40">
          Acceso restringido · Solo personal autorizado
        </p>
      </div>
    </main>
  )
}
