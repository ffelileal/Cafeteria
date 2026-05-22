import { Container } from '@/components/container'
import { FooterSection } from '@/components/sections/footer-section'
import { Navbar } from '@/components/sections/navbar'

export default function CookiesPage() {
  return (
    <main>
      <Navbar />
      <Container className="pb-16 pt-32">
        <h1 className="font-serif text-3xl font-light tracking-[0.2em] text-foreground">Cookies</h1>
        <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
          En {" "}
          <span className="font-semibold text-foreground">ARTISAN</span> utilizamos cookies para mejorar
          la experiencia de navegación, recordar sus preferencias y analizar el rendimiento del sitio.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          Puedes aceptar, rechazar o personalizar el uso de cookies desde la configuración de tu navegador.
          Para más información, contáctanos a nuestra dirección de correo.
        </p>
      </Container>
      <FooterSection />
    </main>
  )
}
