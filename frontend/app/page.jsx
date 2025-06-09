import { Navbar } from "@/components/features/navigation/navbar"
import { HeroSection } from "@/components/features/home/hero-section"
import { BenefitsSection } from "@/components/features/home/benefits-section"
import { ClassificationSection } from "@/components/features/shared/classification-section"
import { MapSection } from "@/components/features/maps/map-section"
import { TechnologiesSection } from "@/components/features/home/technologies-section"
import { Footer } from "@/components/features/shared/footer"
import { ScrollToTop } from "@/components/features/shared/scroll-to-top"

// Disable static optimization for this page because it uses auth context
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <BenefitsSection />
        <ClassificationSection />
        <MapSection />
        <TechnologiesSection />
        <ScrollToTop />
      </main>
      <Footer />
    </div>
  )
}
