'use client'

import Link from 'next/link'
import { Instagram, Facebook, MessageCircle } from 'lucide-react'
import { Container } from '@/components/container'
import { BRAND, CONTACT_INFO } from '@/lib/constants'

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'WhatsApp', href: `https://wa.me/${CONTACT_INFO.phone.replace(/\D/g, '')}`, icon: MessageCircle },
]

const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  CONTACT_INFO.address
)}`

export function FooterSection() {
  return (
    <footer className="border-t border-white/10 bg-[linear-gradient(180deg,#090807,#130d0b)] py-14 text-white">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.95fr_0.85fr]">
          <div>
            <p className="font-serif text-lg tracking-[0.2em] text-white">{BRAND.name}</p>
            <p className="mt-3 max-w-lg text-sm leading-7 text-stone-200/80">
              {BRAND.description}
            </p>
            <p className="mt-5 text-sm text-stone-100">
              {CONTACT_INFO.address}
            </p>
            <div className="mt-4 space-y-2 text-sm text-stone-100">
              <a href={`tel:${CONTACT_INFO.phone.replace(/\D/g, '')}`} className="block transition hover:text-amber-100">
                Tel: {CONTACT_INFO.phone}
              </a>
              <a href={`mailto:${CONTACT_INFO.email}`} className="block transition hover:text-amber-100">
                {CONTACT_INFO.email}
              </a>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-amber-100/80">Horario</p>
            <p className="mt-4 text-sm text-stone-100">Lunes a viernes: {CONTACT_INFO.hours.weekdays}</p>
            <p className="mt-2 text-sm text-stone-100">Sábados y domingos: {CONTACT_INFO.hours.weekends}</p>
            <div className="mt-5">
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-amber-100 hover:text-amber-50"
              >
                Ver ubicación en el mapa
              </a>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-amber-100/80">Síguenos</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-100 transition hover:border-amber-100 hover:text-amber-50"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 text-sm text-stone-100/80">
              <Link href="/cookies" className="transition hover:text-amber-100">
                Cookies
              </Link>
              <Link href="/legal" className="transition hover:text-amber-100">
                Derechos reservados
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-sm text-stone-200/70">
          © {new Date().getFullYear()} {BRAND.name}. Sabor, silencio y atención artesanal.
        </div>
      </Container>
    </footer>
  )
}
