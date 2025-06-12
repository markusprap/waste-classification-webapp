"use client";

import React from "react";
import { useLanguage } from "@/models/language-context";
import { Brain, Target, Recycle, Lightbulb } from "lucide-react";

export default function WasteAIAboutSection() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "About WasteWise AI",
      subtitle: "Revolutionizing waste management through artificial intelligence",
      description: "WasteWise AI is an innovative web application that leverages machine learning and computer vision to classify waste materials automatically. Our mission is to promote environmental sustainability by making waste sorting more accessible, accurate, and educational for everyone.",
      objectives: [
        {
          icon: Brain,
          title: "AI-Powered Classification",
          description: "Using advanced machine learning models to accurately identify and classify different types of waste materials."
        },
        {
          icon: Target,
          title: "Environmental Impact",
          description: "Helping reduce environmental pollution by promoting proper waste segregation and recycling practices."
        },
        {
          icon: Recycle,
          title: "Sustainable Future",
          description: "Contributing to a circular economy by encouraging responsible waste management habits."
        },
        {
          icon: Lightbulb,
          title: "Education & Awareness",
          description: "Educating users about proper waste disposal methods and environmental conservation."
        }
      ]
    },
    id: {
      title: "Tentang WasteWise AI",
      subtitle: "Merevolusi pengelolaan sampah melalui kecerdasan buatan",
      description: "WasteWise AI adalah aplikasi web inovatif yang memanfaatkan machine learning dan computer vision untuk mengklasifikasikan material sampah secara otomatis. Misi kami adalah mempromosikan keberlanjutan lingkungan dengan membuat pemilahan sampah lebih mudah diakses, akurat, dan edukatif untuk semua orang.",
      objectives: [
        {
          icon: Brain,
          title: "Klasifikasi Bertenaga AI",
          description: "Menggunakan model machine learning canggih untuk mengidentifikasi dan mengklasifikasikan berbagai jenis material sampah dengan akurat."
        },
        {
          icon: Target,
          title: "Dampak Lingkungan",
          description: "Membantu mengurangi polusi lingkungan dengan mempromosikan praktik pemilahan sampah dan daur ulang yang tepat."
        },
        {
          icon: Recycle,
          title: "Masa Depan Berkelanjutan",
          description: "Berkontribusi pada ekonomi sirkular dengan mendorong kebiasaan pengelolaan sampah yang bertanggung jawab."
        },
        {
          icon: Lightbulb,
          title: "Edukasi & Kesadaran",
          description: "Mengedukasi pengguna tentang metode pembuangan sampah yang tepat dan konservasi lingkungan."
        }
      ]
    }
  };

  const t = content[language];

  return (
    <section className="pt-24 pb-20 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            {t.subtitle}
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {t.objectives.map((objective, index) => {
            const IconComponent = objective.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-xl mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-300">
                  <IconComponent className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {objective.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {objective.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
