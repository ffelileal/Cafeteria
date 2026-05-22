'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, isBefore, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import { Container } from '@/components/container'
import { SectionTitle } from '@/components/section-title'
import {
  RESERVATION_TIME_SLOTS,
  GUEST_OPTIONS,
  OCCASION_OPTIONS,
  SEATING_OPTIONS,
  CONTACT_INFO,
} from '@/lib/constants'
import { staggerContainer, fadeInUp, scaleUp } from '@/lib/animations'
import { cn } from '@/lib/utils'

type ReservationStep = 'details' | 'contact' | 'confirmation'

interface ReservationData {
  date: Date | undefined
  time: string
  guests: string
  occasion: string
  seating: string
  name: string
  email: string
  phone: string
  notes: string
}

export function ReservationSection() {
  const [step, setStep] = useState<ReservationStep>('details')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  
  const [formData, setFormData] = useState<ReservationData>({
    date: undefined,
    time: '',
    guests: '2',
    occasion: 'casual',
    seating: 'any',
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  const today = startOfToday()
  const maxDate = addDays(today, 30) // Allow reservations up to 30 days in advance

  const updateFormData = (field: keyof ReservationData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (step === 'details') {
      setStep('contact')
    } else if (step === 'contact') {
      handleSubmit()
    }
  }

  const handlePrevStep = () => {
    if (step === 'contact') {
      setStep('details')
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
    setStep('confirmation')
  }

  const handleReset = () => {
    setFormData({
      date: undefined,
      time: '',
      guests: '2',
      occasion: 'casual',
      seating: 'any',
      name: '',
      email: '',
      phone: '',
      notes: '',
    })
    setStep('details')
    setIsSuccess(false)
  }

  const isDetailsValid = formData.date && formData.time && formData.guests
  const isContactValid = formData.name && formData.email && formData.phone

  return (
    <section id="reservar" className="relative overflow-hidden bg-card py-24 md:py-32">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <Container className="relative z-10">
        <SectionTitle
          eyebrow="Reservaciones"
          title="Reserva Tu Mesa"
          subtitle="Asegura tu lugar en nuestra cafetería y disfruta de una experiencia inolvidable"
          align="center"
        />

        <div className="mx-auto mt-16 max-w-3xl">
          {/* Progress Steps */}
          <div className="mb-12 flex items-center justify-center gap-4">
            {['details', 'contact', 'confirmation'].map((s, index) => (
              <div key={s} className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-300',
                    step === s
                      ? 'border-primary bg-primary text-primary-foreground'
                      : s === 'confirmation' && isSuccess
                      ? 'border-green-500 bg-green-500 text-white'
                      : (step === 'contact' && s === 'details') || (step === 'confirmation' && s !== 'confirmation')
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border bg-transparent text-muted-foreground'
                  )}
                >
                  {s === 'confirmation' && isSuccess ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div
                    className={cn(
                      'h-px w-12 transition-all duration-300 md:w-24',
                      (step === 'contact' && index === 0) ||
                      (step === 'confirmation' && index <= 1)
                        ? 'bg-primary'
                        : 'bg-border'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Reservation Details */}
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Date & Time Row */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Date Picker */}
                  <div className="relative">
                    <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Fecha
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-none border bg-background px-4 py-4 text-left transition-all duration-300',
                        'hover:border-primary focus:border-primary focus:outline-none',
                        formData.date ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      <span>
                        {formData.date
                          ? format(formData.date, "EEEE, d 'de' MMMM", { locale: es })
                          : 'Selecciona una fecha'}
                      </span>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {showCalendar && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-border bg-card p-4 shadow-2xl"
                        >
                          <DayPicker
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => {
                              updateFormData('date', date)
                              setShowCalendar(false)
                            }}
                            disabled={(date) => isBefore(date, today) || isBefore(maxDate, date)}
                            locale={es}
                            classNames={{
                              months: 'flex flex-col',
                              month: 'space-y-4',
                              caption: 'flex justify-center pt-1 relative items-center',
                              caption_label: 'text-sm font-medium text-foreground capitalize',
                              nav: 'space-x-1 flex items-center',
                              nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center',
                              nav_button_previous: 'absolute left-1',
                              nav_button_next: 'absolute right-1',
                              table: 'w-full border-collapse space-y-1',
                              head_row: 'flex',
                              head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] uppercase',
                              row: 'flex w-full mt-2',
                              cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                              day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 rounded-md transition-colors',
                              day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                              day_today: 'bg-accent text-accent-foreground',
                              day_outside: 'text-muted-foreground opacity-50',
                              day_disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
                              day_hidden: 'invisible',
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Time Picker */}
                  <div>
                    <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Hora
                    </label>
                    <div className="relative">
                      <select
                        value={formData.time}
                        onChange={(e) => updateFormData('time', e.target.value)}
                        className={cn(
                          'w-full appearance-none rounded-none border bg-background px-4 py-4 pr-10 transition-all duration-300',
                          'hover:border-primary focus:border-primary focus:outline-none',
                          formData.time ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        <option value="">Selecciona una hora</option>
                        {RESERVATION_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Guests & Occasion Row */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Guests */}
                  <div>
                    <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Personas
                    </label>
                    <div className="relative">
                      <select
                        value={formData.guests}
                        onChange={(e) => updateFormData('guests', e.target.value)}
                        className="w-full appearance-none rounded-none border bg-background px-4 py-4 pr-10 text-foreground transition-all duration-300 hover:border-primary focus:border-primary focus:outline-none"
                      >
                        {GUEST_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Occasion */}
                  <div>
                    <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Ocasión
                    </label>
                    <div className="relative">
                      <select
                        value={formData.occasion}
                        onChange={(e) => updateFormData('occasion', e.target.value)}
                        className="w-full appearance-none rounded-none border bg-background px-4 py-4 pr-10 text-foreground transition-all duration-300 hover:border-primary focus:border-primary focus:outline-none"
                      >
                        {OCCASION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Seating Preference */}
                <div>
                  <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Preferencia de asiento
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {SEATING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateFormData('seating', option.value)}
                        className={cn(
                          'rounded-none border px-4 py-2 text-sm transition-all duration-300',
                          formData.seating === option.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-transparent text-foreground hover:border-primary/50'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isDetailsValid}
                    className={cn(
                      'group flex items-center gap-3 border px-8 py-4 text-xs uppercase tracking-[0.2em] transition-all duration-300',
                      isDetailsValid
                        ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'cursor-not-allowed border-border bg-muted text-muted-foreground'
                    )}
                  >
                    Continuar
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Information */}
            {step === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Summary Card */}
                <div className="rounded-none border border-primary/30 bg-primary/5 p-6">
                  <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-primary">Resumen de tu reserva</h3>
                  <div className="grid gap-4 text-sm md:grid-cols-4">
                    <div>
                      <span className="text-muted-foreground">Fecha</span>
                      <p className="mt-1 text-foreground">
                        {formData.date && format(formData.date, "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hora</span>
                      <p className="mt-1 text-foreground">{formData.time}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Personas</span>
                      <p className="mt-1 text-foreground">
                        {GUEST_OPTIONS.find(o => o.value === formData.guests)?.label}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ubicación</span>
                      <p className="mt-1 text-foreground">
                        {SEATING_OPTIONS.find(o => o.value === formData.seating)?.label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full rounded-none border bg-background px-4 py-4 text-foreground transition-all duration-300 placeholder:text-muted-foreground hover:border-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full rounded-none border bg-background px-4 py-4 text-foreground transition-all duration-300 placeholder:text-muted-foreground hover:border-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+52 55 1234 5678"
                      className="w-full rounded-none border bg-background px-4 py-4 text-foreground transition-all duration-300 placeholder:text-muted-foreground hover:border-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Notas adicionales
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => updateFormData('notes', e.target.value)}
                      placeholder="Alergias, preferencias especiales, solicitudes..."
                      rows={4}
                      className="w-full resize-none rounded-none border bg-background px-4 py-4 text-foreground transition-all duration-300 placeholder:text-muted-foreground hover:border-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="group flex items-center gap-3 border border-border px-8 py-4 text-xs uppercase tracking-[0.2em] text-foreground transition-all duration-300 hover:border-primary hover:text-primary"
                  >
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isContactValid || isSubmitting}
                    className={cn(
                      'group flex items-center gap-3 border px-8 py-4 text-xs uppercase tracking-[0.2em] transition-all duration-300',
                      isContactValid && !isSubmitting
                        ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'cursor-not-allowed border-border bg-muted text-muted-foreground'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Confirmando...
                      </>
                    ) : (
                      <>
                        Confirmar Reserva
                        <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 'confirmation' && isSuccess && (
              <motion.div
                key="confirmation"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="text-center"
              >
                <motion.div
                  variants={scaleUp}
                  className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10"
                >
                  <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>

                <motion.h3
                  variants={fadeInUp}
                  className="mb-4 font-serif text-3xl text-foreground md:text-4xl"
                >
                  Reserva Confirmada
                </motion.h3>

                <motion.p
                  variants={fadeInUp}
                  className="mx-auto mb-8 max-w-md text-muted-foreground"
                >
                  Hemos enviado los detalles de tu reserva a <span className="text-foreground">{formData.email}</span>. 
                  Te esperamos con un café recién preparado.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="mx-auto mb-10 max-w-md rounded-none border border-border bg-card p-6"
                >
                  <div className="grid gap-4 text-left text-sm">
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Fecha y hora</span>
                      <span className="text-foreground">
                        {formData.date && format(formData.date, "d MMM yyyy", { locale: es })} a las {formData.time}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Personas</span>
                      <span className="text-foreground">
                        {GUEST_OPTIONS.find(o => o.value === formData.guests)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Nombre</span>
                      <span className="text-foreground">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confirmación</span>
                      <span className="font-mono text-primary">#ART{Date.now().toString(36).toUpperCase()}</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="border border-border px-8 py-4 text-xs uppercase tracking-[0.2em] text-foreground transition-all duration-300 hover:border-primary hover:text-primary"
                  >
                    Nueva Reserva
                  </button>
                  <a
                    href={`tel:${CONTACT_INFO.phone}`}
                    className="flex items-center gap-2 border border-primary bg-primary px-8 py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-all duration-300 hover:bg-primary/90"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    Llamar para cambios
                  </a>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  )
}
