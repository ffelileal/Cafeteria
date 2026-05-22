'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Award, Coffee, HeartHandshake, Leaf, Sparkles } from 'lucide-react'
import { Container } from '@/components/container'
import { PremiumButton } from '@/components/premium-button'
import { CONTACT_INFO } from '@/lib/constants'
import { premiumEase } from '@/lib/animations'

const philosophyItems = [
  {
    icon: Leaf,
    title: 'Calidad artesanal',
    description: 'Cada taza se prepara con cuidado, temperatura y ritmo para respetar el origen del café.',
  },
  {
    icon: Coffee,
    title: 'Granos seleccionados',
    description: 'Trabajamos con perfiles internacionales y tostado diario para una experiencia consistente.',
  },
  {
    icon: Sparkles,
    title: 'Experiencia sensorial',
    description: 'Texturas, aromas y notas que convierten cada sorbo en un momento memorable.',
  },
  {
    icon: HeartHandshake,
    title: 'Comunidad y conexión',
    description: 'Un espacio pensado para compartir, conversar y volver con una sensación distinta.',
  },
]

const localExperience = [
  {
    title: 'Café',
    text: 'Cremas delicadas, espresso concentrado y bebidas de temporada.',
    tone: 'from-stone-950/90 via-stone-900/60 to-transparent',
  },
  {
    title: 'Baristas',
    text: 'Un equipo atento que cuida cada detalle desde el primer barrido hasta la última gota.',
    tone: 'from-amber-950/90 via-amber-900/60 to-transparent',
  },
  {
    title: 'Pastelería',
    text: 'Panificados y repostería artesanal para acompañar la bebida con calidez.',
    tone: 'from-emerald-950/90 via-emerald-900/60 to-transparent',
  },
  {
    title: 'Ambiente',
    text: 'Líneas limpias, madera cálida y una atmósfera íntima para quedarse.',
    tone: 'from-neutral-950/90 via-neutral-900/60 to-transparent',
  },
  {
    title: 'Brunch',
    text: 'Momentos para desayunar, conversar y recibir la mañana con una pausa amable.',
    tone: 'from-orange-950/90 via-orange-900/60 to-transparent',
  },
  {
    title: 'Detalles del local',
    text: 'Texturas suaves, iluminación cálida y objetos elegidos para hacer el espacio sentir único.',
    tone: 'from-rose-950/90 via-rose-900/60 to-transparent',
  },
]

const stats = [
  { value: '+12', label: 'cafés exclusivos' },
  { value: '+500', label: 'clientes felices' },
  { value: 'Internacional', label: 'granos seleccionados' },
  { value: 'Diario', label: 'tostado artesanal' },
]

const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  CONTACT_INFO.address
)}`

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: premiumEase,
    },
  },
}

export function AboutSection() {
  return (
    <div className="bg-background text-foreground">
      <section id="nosotros" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-coffee.jpg"
            alt="Cafetería ARTISAN"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(12,10,9,0.88),rgba(12,10,9,0.66),rgba(12,10,9,0.88))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_25%)]" />
        </div>

        <Container className="relative z-10 pb-24 pt-32 sm:pt-36 lg:pt-40">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
            className="max-w-3xl"
          >
            <motion.p
              variants={fadeUp}
              className="text-xs uppercase tracking-[0.35em] text-amber-100/80"
            >
              ARTISAN · historia y esencia
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-6 font-serif text-4xl font-light leading-[0.95] text-white sm:text-5xl md:text-6xl"
            >
              Más que café, una experiencia.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-base leading-7 text-stone-100/85 sm:text-lg"
            >
              Nacimos de una búsqueda: encontrar el café que no solo despierta, sino que conecta.
              En ARTISAN cada taza es una invitación a detenerse, respirar y volver a sentir.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap gap-4"
            >
              <PremiumButton variant="primary" size="lg" href="/menu">
                Explorar menú
              </PremiumButton>
              <PremiumButton
                variant="outline"
                size="lg"
                href={mapUrl}
                className="border-white/30 text-white hover:border-amber-200 hover:text-amber-100"
              >
                Visítanos
              </PremiumButton>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-primary">Nuestra historia</p>
            <h2 className="mt-4 font-serif text-3xl font-light text-foreground sm:text-4xl">
              Un lugar creado desde la pasión y cuidado.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
              <p>
                ARTISAN nació de una simple idea: el café de especialidad puede ser tan preciso como un
                instrumento musical y tan humano como una buena conversación.
              </p>
              <p>
                Comenzamos con una búsqueda de granos que contaran historias, tostados con respeto y
                preparados con intención. Poco a poco, ese proyecto se convirtió en un espacio pensado
                para conectar personas, en un ritmo más lento, con una atención real.
              </p>
              <p>
                Hoy el local combina la calidez de una cafetería artesanal con una estética moderna y
                elegante, donde el aroma del café, la luz suave y el trato cercano forman parte del mismo
                lenguaje.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[28px] border border-border/60 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 p-6 text-white shadow-[0_25px_80px_rgba(15,23,42,0.18)]"
          >
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">Quote</p>
              <p className="mt-4 font-serif text-2xl leading-tight text-white sm:text-3xl">
                “Cada taza es una pausa, y cada pausa se vuelve parte de la memoria del lugar.”
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-stone-100/80">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Café con propósito</p>
                  <p>experiencia artesanal y premium</p>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="pb-20 sm:pb-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-primary">Filosofía</p>
            <h2 className="mt-4 font-serif text-3xl font-light text-foreground sm:text-4xl">
              Todo nace del detalle.
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {philosophyItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[24px] border border-border/60 bg-card p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </motion.article>
              )
            })}
          </div>
        </Container>
      </section>

      <section className="pb-20 sm:pb-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-primary">Experiencia del local</p>
            <h2 className="mt-4 font-serif text-3xl font-light text-foreground sm:text-4xl">
              Cada rincón está pensado para quedarse.
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {localExperience.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-[24px] border border-border/60 bg-card p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.tone} opacity-80`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_28%)]" />
                <div className="relative z-10 flex min-h-[220px] flex-col justify-end">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/80">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-white/90">{item.text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20 sm:pb-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[24px] border border-border/60 bg-card px-5 py-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.06)]"
              >
                <p className="font-serif text-3xl text-foreground sm:text-4xl">{stat.value}</p>
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      <section className="pb-24 sm:pb-28">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,10,8,0.98),rgba(39,24,15,0.95))] px-6 py-10 shadow-[0_30px_120px_rgba(15,23,42,0.25)] sm:px-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_25%)]" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.35em] text-amber-100/80">Visítanos</p>
                <h2 className="mt-4 font-serif text-3xl font-light text-white sm:text-4xl">
                  Ven a vivir el café con calma, sabor y atención.
                </h2>
                <p className="mt-4 text-sm leading-7 text-stone-100/85 sm:text-base">
                  Te esperamos para compartir una experiencia que combina granos selectos, ambiente cuidado
                  y una pausa que vale la pena.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <PremiumButton variant="primary" size="lg" href="/menu">
                  Explorar menú
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  size="lg"
                  href={mapUrl}
                  className="border-white/30 text-white hover:border-amber-100 hover:text-amber-50"
                >
                  Ver ubicación
                </PremiumButton>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}
