"use client";

import React from "react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { ScrollToTop } from "@/components/common/scroll-to-top";
import WasteAIAboutSection from "./waste-ai-about-section";
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
