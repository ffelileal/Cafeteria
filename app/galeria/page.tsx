import { Navbar } from '@/components/sections/navbar'
import { FooterSection } from '@/components/sections/footer-section'
import { ExperienceSection } from '@/components/sections/experience-section'

export default function GaleriaPage() {
  return (
    <main className="relative overflow-x-hidden bg-background">
      <Navbar />
      <ExperienceSection />
      <FooterSection />
    </main>
  )
}
