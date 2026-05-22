import { Container } from '@/components/container'
import { FooterSection } from '@/components/sections/footer-section'
import { Navbar } from '@/components/sections/navbar'

export default function LegalPage() {
  return (
    <main>
      <Navbar />
      <Container className="pb-16 pt-32">
        <h1 className="font-serif text-3xl font-light tracking-[0.2em] text-foreground">Derechos reservados</h1>
        <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
          Todos los contenidos, marcas, diseños y material gráfico de {" "}
          <span className="font-semibold text-foreground">ARTISAN</span> están protegidos por derechos de autor.
          La reproducción total o parcial sin autorización expresa está prohibida.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          Si necesitas usar contenido del sitio con fines comerciales o editoriales, contacta con nosotros
          para solicitar autorización.
        </p>
      </Container>
      <FooterSection />
    </main>
  )
}
