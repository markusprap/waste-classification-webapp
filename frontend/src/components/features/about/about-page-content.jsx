"use client";

import React from "react";
import { Navbar } from "@/components/features/navigation/navbar";
import { Footer } from "@/components/features/shared/footer";
import { ScrollToTop } from "@/components/features/shared/scroll-to-top";
import WasteAIAboutSection from "../home/waste-ai-about-section";
import AboutTeamSection from "./about-team-section";
import { TechnologiesSection } from "../home/technologies-section";
import SupportedBySection from "./supported-by-section";

export default function AboutPageContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <WasteAIAboutSection />
        <AboutTeamSection />
        <SupportedBySection />
        <TechnologiesSection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
