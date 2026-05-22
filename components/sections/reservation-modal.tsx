'use client'

import { useState } from 'react'
import { format, addDays, isBefore, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import { Container } from '@/components/container'
import { PremiumButton } from '@/components/premium-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CONTACT_INFO, RESERVATION_TIME_SLOTS, GUEST_OPTIONS, SEATING_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ReservationData {
  date: Date | undefined
  time: string
  guests: string
  seating: string
  name: string
  email: string
  phone: string
  notes: string
}

type ReservationStep = 'details' | 'contact' | 'confirmation'

const cleanPhone = CONTACT_INFO.phone.replace(/\D/g, '')
const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola, quiero reservar una mesa.')}`

export function ReservationModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<ReservationStep>('details')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [formData, setFormData] = useState<ReservationData>({
    date: undefined,
    time: '',
    guests: '2',
    seating: 'any',
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  const today = startOfToday()
  const maxDate = addDays(today, 30)

  const updateFormData = (field: keyof ReservationData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNextStep = async () => {
    if (step === 'details') {
      setStep('contact')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1200))
    setIsSubmitting(false)
    setIsSuccess(true)
    setStep('confirmation')
  }

  const handleStartOver = () => {
    setFormData({
      date: undefined,
      time: '',
      guests: '2',
      seating: 'any',
      name: '',
      email: '',
      phone: '',
      notes: '',
    })
    setStep('details')
    setIsSuccess(false)
  }

  const handleClose = () => {
    setOpen(false)
    handleStartOver()
  }

  const isDetailsValid = !!formData.date && !!formData.time && !!formData.guests
  const isContactValid = !!formData.name && !!formData.email && !!formData.phone

  return (
    <section className="relative bg-background py-24 md:py-28">
      <Container>
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-card/70 px-6 py-12 text-center shadow-2xl backdrop-blur-xl sm:px-10 sm:py-14">
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-primary/80">Reservaciones</p>
          <h2 className="mb-4 text-3xl font-serif font-light text-foreground sm:text-4xl">
            Reserva una mesa sin salir de la página
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Para reservar, abre el formulario rápido o contáctanos directamente por WhatsApp.
          </p>

          <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row sm:justify-center">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <PremiumButton variant="primary" size="lg" className="w-full sm:w-auto">
                  Reservar ahora
                </PremiumButton>
              </DialogTrigger>

              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Reservar mesa</DialogTitle>
                  <DialogDescription>
                    Completa los datos a continuación. Si prefieres, también puedes reservar por WhatsApp.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  {step === 'details' && (
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-foreground">Fecha</label>
                          <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            className={cn(
                              'w-full rounded-2xl border px-4 py-4 text-left transition',
                              'border-border bg-background text-left text-foreground'
                            )}
                          >
                            {formData.date
                              ? format(formData.date, "EEEE, d 'de' MMMM", { locale: es })
                              : 'Elige una fecha'}
                          </button>
                          {showCalendar && (
                            <div className="relative z-20 rounded-3xl border border-border bg-card p-4 shadow-xl">
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
                                  months: 'flex flex-col gap-4',
                                  month: 'space-y-4',
                                  caption: 'flex items-center justify-between gap-4',
                                  caption_label: 'text-base font-medium text-foreground',
                                  nav: 'flex items-center gap-2',
                                  nav_button: 'inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground',
                                  table: 'w-full border-separate border-spacing-[0.35rem]',
                                  head_row: 'flex',
                                  head_cell: 'w-9 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground',
                                  row: 'flex w-full',
                                  cell: 'w-9 rounded-md text-center text-sm text-foreground hover:bg-primary/10 focus-within:relative focus-within:z-20',
                                  day: 'h-9 w-9 rounded-md transition-colors',
                                  day_selected: 'bg-primary text-primary-foreground',
                                  day_today: 'bg-accent text-accent-foreground',
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-foreground">Hora</label>
                          <select
                            value={formData.time}
                            onChange={(e) => updateFormData('time', e.target.value)}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-foreground transition"
                          >
                            <option value="">Selecciona una hora</option>
                            {RESERVATION_TIME_SLOTS.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-foreground">Personas</label>
                          <select
                            value={formData.guests}
                            onChange={(e) => updateFormData('guests', e.target.value)}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-foreground transition"
                          >
                            {GUEST_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground">Preferencia</label>
                          <select
                            value={formData.seating}
                            onChange={(e) => updateFormData('seating', e.target.value)}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-foreground transition"
                          >
                            {SEATING_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 'contact' && (
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-foreground">Nombre</label>
                          <input
                            value={formData.name}
                            onChange={(e) => updateFormData('name', e.target.value)}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-foreground transition"
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground">Correo electrónico</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-foreground transition"
                            placeholder="ejemplo@correo.com"
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-foreground">Teléfono</label>
                          <input
                            value={formData.phone}
                            onChange={(e) => updateFormData('phone', e.target.value)}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-foreground transition"
                            placeholder="+52 55 1234 5678"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground">Notas</label>
                          <input
                            value={formData.notes}
                            onChange={(e) => updateFormData('notes', e.target.value)}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-foreground transition"
                            placeholder="Petición especial (opcional)"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 'confirmation' && (
                    <div className="space-y-6 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">Reserva confirmada</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        ¡Gracias por reservar! Recibirás un mensaje de confirmación en breve.
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  {step !== 'confirmation' ? (
                    <>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full border border-border px-5 py-3 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        disabled={
                          (step === 'details' && !isDetailsValid) ||
                          (step === 'contact' && !isContactValid) ||
                          isSubmitting
                        }
                        className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {step === 'details' ? 'Siguiente' : isSubmitting ? 'Enviando...' : 'Confirmar'}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      Cerrar
                    </button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-5 py-4 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary sm:w-auto"
            >
              Reservar por WhatsApp
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}
