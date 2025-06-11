"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/models/language-context";

export default function SupportedBySection() {
  const { language } = useLanguage();
  const content = {
    id: {
      title: "Didukung Oleh",
      description: "WasteWise AI merupakan capstone project yang dikembangkan oleh tim CC25-CP053 dengan dukungan dari program Coding Camp 2025 powered by DBS Foundation dan Dicoding Indonesia."
    },
    en: {
      title: "Supported By",
      description: "WasteWise AI is a capstone project developed by team CC25-CP053 with support from the Coding Camp 2025 powered by DBS Foundation program and Dicoding Indonesia."
    }
  };

  const currentContent = content[language] || content.en;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentContent.title}</h2>
          <p className="text-lg text-gray-600">
            {currentContent.description}
          </p>
        </div>
          <div className="flex flex-wrap justify-center items-center gap-12 mt-10">
          <div className="flex flex-col items-center">
            <div className="relative h-24 w-64">
              <Image
                src="/images/logos/coding-camp-logo.png"
                alt="Coding Camp 2025 powered by DBS Foundation"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative h-24 w-64">
              <Image
                src="/images/logos/dicoding-logo.png"
                alt="Dicoding Indonesia"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
