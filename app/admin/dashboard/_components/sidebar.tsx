'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/app/admin/actions'

// ── Icons ─────────────────────────────────────────────────────────────────────

const GridIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

const ClipboardListIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
)

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const TableIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="4" rx="1" />
    <line x1="7" y1="7" x2="7" y2="21" />
    <line x1="17" y1="7" x2="17" y2="21" />
  </svg>
)

const PackageIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
)

const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)


const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
)

const CoffeeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>
)

const StoreIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
  </svg>
)

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: GridIcon },
  { href: '/admin/orders', label: 'Pedidos', icon: ClipboardListIcon },
  { href: '/admin/products', label: 'Productos', icon: PackageIcon },
  { href: '/admin/reservations', label: 'Reservas', icon: CalendarIcon },
  { href: '/admin/tables', label: 'Mesas', icon: TableIcon },
]

const SITE_LINKS = [
  { href: '/', label: 'Inicio', icon: HomeIcon },
  { href: '/menu', label: 'Menú', icon: CoffeeIcon },
  { href: '/tienda', label: 'Tienda', icon: StoreIcon },
]

interface NavItemProps {
  href: string
  label: string
  icon: React.FC<{ className?: string }>
  active: boolean
  onClick?: () => void
}

function NavItem({ href, label, icon: Icon, active, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150',
        active
          ? 'bg-primary/10 font-medium text-primary'
          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

// ── Sidebar content ───────────────────────────────────────────────────────────

function SidebarContent({ email, pathname, onClose }: { email: string; pathname: string; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-5">
        <div>
          <p className="font-serif text-lg font-light tracking-[0.2em] text-foreground">ARTISAN</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Admin</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {NAV.map(item => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href || pathname.startsWith(item.href + '/')}
              onClick={onClose}
            />
          ))}
        </div>

        {/* Site links */}
        <div className="mt-6">
          <p className="mb-1.5 px-3 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
            Sitio público
          </p>
          <div className="space-y-1">
            {SITE_LINKS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all duration-150 hover:bg-muted/40 hover:text-foreground"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border/40 p-4 space-y-3">

        <div className="px-3">
          <p className="truncate text-xs text-muted-foreground">{email}</p>
          <form action={logoutAction} className="mt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-destructive"
            >
              <LogOutIcon className="h-3 w-3" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function Sidebar({ email }: { email: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar — in flow */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border/50 bg-card/20 lg:flex sticky top-0">
        <SidebarContent email={email} pathname={pathname} />
      </aside>

      {/* Mobile: top bar */}
      <div className="fixed left-0 right-0 top-0 z-30 flex items-center gap-3 border-b border-border/50 bg-background/95 px-4 py-3.5 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MenuIcon className="h-4 w-4" />
        </button>
        <span className="font-serif text-base tracking-[0.2em] text-foreground">ARTISAN</span>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-primary">
          Admin
        </span>
      </div>

      {/* Mobile: drawer overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/50 bg-background lg:hidden">
            <SidebarContent
              email={email}
              pathname={pathname}
              onClose={() => setIsOpen(false)}
            />
          </aside>
        </>
      )}
    </>
  )
}
