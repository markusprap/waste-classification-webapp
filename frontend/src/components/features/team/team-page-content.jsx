"use client";

import React from "react";
import { Navbar } from "@/components/features/navigation/navbar";
import { Footer } from "@/components/features/shared/footer";
import { ScrollToTop } from "@/components/features/shared/scroll-to-top";
import WasteAIAboutSection from "../home/waste-ai-about-section";
import TeamMembersSection from "./team-members-section";
import { TechnologiesSection } from "../home/technologies-section";

export default function TeamPageContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <WasteAIAboutSection />
        <TeamMembersSection />
        <TechnologiesSection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
