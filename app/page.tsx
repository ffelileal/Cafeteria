import { FooterSection, Navbar, HeroSection, ReservationModal } from '@/components/sections'

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ReservationModal />
      <FooterSection />
    </main>
  )
}
