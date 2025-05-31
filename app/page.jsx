import { Navbar } from "@/components/common/navbar"
import { HeroSection } from "@/components/home/hero-section"
import { BenefitsSection } from "@/components/home/benefits-section"
import { ClassificationSection } from "@/components/home/classification-section"
import { MapSection } from "@/components/home/map-section"
import { TechnologiesSection } from "@/components/home/technologies-section"
import { Footer } from "@/components/common/footer"
import { ScrollToTop } from "@/components/common/scroll-to-top"

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
