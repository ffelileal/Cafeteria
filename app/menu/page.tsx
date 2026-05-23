import Link from 'next/link'
import { FooterSection, MenuSection } from '@/components/sections'
import { MesaBanner } from './_components/mesa-banner'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MenuPage({ searchParams }: PageProps) {
  const params = await searchParams
  const mesaSlug = typeof params.mesa === 'string' ? params.mesa : undefined

  return (
    <main className="relative overflow-x-hidden">
      {/* Mesa banner — only shown when arriving from a QR code */}
      {mesaSlug && <MesaBanner slug={mesaSlug} />}

      <header className="sticky top-0 z-50 border-b border-border/20 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-serif text-xl font-light tracking-[0.2em] text-foreground">
            ARTISAN
          </Link>
          <Link
            href="/"
            className="rounded-full border border-foreground/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground transition hover:border-primary hover:text-primary"
          >
            Volver al inicio
          </Link>
        </div>
      </header>

      <MenuSection />
      <FooterSection />
    </main>
  )
}
