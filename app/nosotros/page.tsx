import { Navbar } from '@/components/sections/navbar'
import { FooterSection } from '@/components/sections/footer-section'
import { AboutSection } from '@/components/sections/about-section'

export default function NosotrosPage() {
  return (
    <main className="relative overflow-x-hidden bg-background">
      <Navbar />
      <AboutSection />
      <FooterSection />
    </main>
  )
}
