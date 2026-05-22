'use client'

import { motion } from 'framer-motion'
import { SectionTitle } from '@/components/section-title'
import { Container } from '@/components/container'

const scenes = [
  {
    title: 'Baristas trabajando',
    description: 'Ritmo preciso, luz tenue y una quietud que deja respirar el café.',
    className: 'lg:col-span-2',
    style: {
      backgroundImage:
        'linear-gradient(135deg, rgba(24,16,10,0.98), rgba(76,42,19,0.78)), radial-gradient(circle at top left, rgba(255,234,197,0.15), transparent 30%), radial-gradient(circle at bottom right, rgba(251,191,36,0.18), transparent 26%)',
    },
  },
  {
    title: 'Latte art',
    description: 'Texturas suaves y detalles que convierten la taza en una pieza íntima.',
    style: {
      backgroundImage:
        'linear-gradient(135deg, rgba(34,22,13,0.96), rgba(116,66,27,0.74)), radial-gradient(circle at top right, rgba(253,230,138,0.16), transparent 28%), radial-gradient(circle at bottom left, rgba(251,191,36,0.12), transparent 24%)',
    },
  },
  {
    title: 'Brunch premium',
    description: 'Un momento para compartir: aromas, mesa cuidada y pausas infinitas.',
    style: {
      backgroundImage:
        'linear-gradient(135deg, rgba(20,15,11,0.96), rgba(61,34,18,0.78)), radial-gradient(circle at bottom, rgba(255,247,237,0.12), transparent 20%), radial-gradient(circle at top left, rgba(251,191,36,0.1), transparent 24%)',
    },
  },
  {
    title: 'Pastelería artesanal',
    description: 'Capas de sabor, miga delicada y un acompañamiento pensado para quedarse.',
    style: {
      backgroundImage:
        'linear-gradient(135deg, rgba(24,15,12,0.98), rgba(82,48,20,0.72)), radial-gradient(circle at top right, rgba(254,215,170,0.15), transparent 26%), radial-gradient(circle at bottom left, rgba(251,191,36,0.1), transparent 20%)',
    },
  },
  {
    title: 'Detalles del local',
    description: 'Materiales cálidos, líneas limpias y una atmósfera pensada con cuidado.',
    style: {
      backgroundImage:
        'linear-gradient(135deg, rgba(15,10,8,0.98), rgba(44,26,15,0.78)), radial-gradient(circle at bottom right, rgba(245,158,11,0.13), transparent 25%), radial-gradient(circle at top left, rgba(255,247,237,0.1), transparent 22%)',
    },
  },
  {
    title: 'Ambiente nocturno',
    description: 'Calor emboscado, sombras suaves y una sensación de pausa que invita a volver.',
    className: 'lg:col-span-2',
    style: {
      backgroundImage:
        'linear-gradient(135deg, rgba(10,8,6,0.98), rgba(58,35,18,0.8)), radial-gradient(circle at top, rgba(253,230,138,0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(245,158,11,0.12), transparent 24%)',
    },
  },
]

export function ExperienceSection() {
  return (
    <section id="experiencia-artisan" className="pb-16 pt-24 sm:pb-20 sm:pt-28 md:pt-32">
      <Container>
        <SectionTitle
          eyebrow="Experiencia ARTISAN"
          title="Un storytelling visual pensado para sentir el lugar."
          subtitle="Cinematográfico, cálido y artesanal: cada rincón invita a mirar con más calma, respirar con más atención y quedarse un poco más."
          align="left"
          className="mb-10"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-5 md:grid-cols-2"
        >
          {scenes.map((scene, index) => (
            <motion.article
              key={scene.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-card p-0 shadow-[0_24px_90px_rgba(15,23,42,0.08)] ${scene.className ?? ''}`}
              style={scene.style}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.25))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,247,237,0.13),transparent_28%)]" />
              <div className="relative flex min-h-[250px] flex-col justify-end p-5 sm:min-h-[280px] sm:p-6">
                <p className="text-[10px] uppercase tracking-[0.35em] text-amber-100/80">{scene.title}</p>
                <p className="mt-3 max-w-sm text-sm leading-7 text-stone-100/85 sm:text-base">
                  {scene.description}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
