"use client";

import React from "react";
import { useLanguage } from "@/models/language-context";
import { Brain, Target, Recycle, Lightbulb } from "lucide-react";

export default function WasteAIAboutSection() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Our Mission & Vision",
      subtitle: "Revolutionizing waste management through artificial intelligence",
      description: "WasteWise AI is an innovative web application that leverages machine learning and computer vision to classify waste materials automatically. Our mission is to promote environmental sustainability by making waste sorting more accessible, accurate, and educational for everyone.",
      objectives: [
        {
          icon: Brain,
          title: "AI-Powered Classification",
          description: "Using advanced machine learning models to accurately identify and classify different types of waste materials.",
          color: "emerald"
        },
        {
          icon: Target,
          title: "Environmental Impact",
          description: "Helping reduce environmental pollution by promoting proper waste segregation and recycling practices.",
          color: "teal"
        },
        {
          icon: Recycle,
          title: "Sustainable Future",
          description: "Contributing to a circular economy by encouraging responsible waste management habits.",
          color: "cyan"
        },
        {
          icon: Lightbulb,
          title: "Education & Awareness",
          description: "Educating users about proper waste disposal methods and environmental conservation.",
          color: "amber"
        }
      ]
    },
    id: {
      title: "Misi & Visi Kami",
      subtitle: "Merevolusi pengelolaan sampah melalui kecerdasan buatan",
      description: "WasteWise AI adalah aplikasi web inovatif yang memanfaatkan machine learning dan computer vision untuk mengklasifikasikan material sampah secara otomatis. Misi kami adalah mempromosikan keberlanjutan lingkungan dengan membuat pemilahan sampah lebih mudah diakses, akurat, dan edukatif untuk semua orang.",
      objectives: [
        {
          icon: Brain,
          title: "Klasifikasi Bertenaga AI",
          description: "Menggunakan model machine learning canggih untuk mengidentifikasi dan mengklasifikasikan berbagai jenis material sampah dengan akurat.",
          color: "emerald"
        },
        {
          icon: Target,
          title: "Dampak Lingkungan",
          description: "Membantu mengurangi polusi lingkungan dengan mempromosikan praktik pemilahan sampah dan daur ulang yang tepat.",
          color: "teal"
        },
        {
          icon: Recycle,
          title: "Masa Depan Berkelanjutan",
          description: "Berkontribusi pada ekonomi sirkular dengan mendorong kebiasaan pengelolaan sampah yang bertanggung jawab.",
          color: "cyan"
        },
        {
          icon: Lightbulb,
          title: "Edukasi & Kesadaran",
          description: "Mengedukasi pengguna tentang metode pembuangan sampah yang tepat dan konservasi lingkungan.",
          color: "amber"
        }
      ]
    }
  };

  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100/50",
    teal: "bg-teal-50 text-teal-600 shadow-teal-100/50",
    cyan: "bg-cyan-50 text-cyan-600 shadow-cyan-100/50",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100/50"
  };

  const t = content[language];

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-[20%] left-[-10%] w-[30%] h-[30%] bg-emerald-50 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-teal-50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 font-bold text-sm mb-6 border border-emerald-100 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {t.title.toUpperCase()}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-gray-900 leading-[1.2] mb-8">
              {t.subtitle}
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-xl">
              {t.description}
            </p>
            <div className="flex gap-10">
              <div>
                <div className="text-3xl font-bold text-gray-900">50K+</div>
                <div className="text-sm font-medium text-gray-400">Items Scanned</div>
              </div>
              <div className="w-px h-12 bg-gray-100"></div>
              <div>
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-sm font-medium text-gray-400">Happy Users</div>
              </div>
            </div>
          </div>

          {/* Right Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {t.objectives.map((objective, index) => {
              const IconComponent = objective.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-[2rem] p-8 border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-14 h-14 rounded-2xl ${colors[objective.color]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-3 tracking-tight">
                    {objective.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {objective.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

