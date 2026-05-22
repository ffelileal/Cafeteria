import { Navbar } from '@/components/sections/navbar'
import { FooterSection } from '@/components/sections/footer-section'
import { StoreSection } from '@/components/sections/store-section'

export default function TiendaPage() {
  return (
    <main className="relative overflow-x-hidden bg-background">
      <Navbar />
      <div className="pt-24 sm:pt-28 md:pt-32">
        <StoreSection />
      </div>
      <FooterSection />
    </main>
  )
}
