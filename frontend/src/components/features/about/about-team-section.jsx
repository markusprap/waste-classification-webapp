"use client";

import React from "react";
import { useLanguage } from "@/models/language-context";
import TeamMemberCard from "../team/team-member-card";

export default function AboutTeamSection() {
  const { language } = useLanguage();
  const content = {
    en: {
      title: "Meet Our Development Team",
      subtitle: "Talented individuals behind the WasteWise AI project"
    },
    id: {
      title: "Tim Pengembang Kami",
      subtitle: "Individu-individu berbakat di balik proyek WasteWise AI"
    }
  };

  // Using the team members data from the original component
  const teamMembers = [
    {
      id: "MC009D5X0397",      name: "Dea Yuliani Sabrina",
      role: {
        en: "Machine Learning Engineer",
        id: "Machine Learning Engineer"
      },
      description: {
        en: "Specializes in developing and optimizing machine learning models for waste classification. Expert in TensorFlow and computer vision algorithms.",
        id: "Spesialis dalam mengembangkan dan mengoptimalkan model machine learning untuk klasifikasi sampah. Ahli di TensorFlow dan algoritma computer vision."
      },
      image: "/images/team/dea.jpeg",
      github: "https://github.com",
      linkedin: "https://linkedin.com"
    },
    {
      id: "FC013D5Y1566",      name: "Markus Prap Kurniawan",
      role: {
        en: "Full-Stack Developer",
        id: "Full-Stack Developer"
      },
      description: {
        en: "Develops both frontend and backend systems. Skilled in React, Next.js, Node.js, and database management for seamless user experience.",
        id: "Mengembangkan sistem frontend dan backend. Ahli di React, Next.js, Node.js, dan manajemen database untuk pengalaman pengguna yang sempurna."
      },
      image: "/images/team/markus.jpg",
      github: "https://github.com",
      linkedin: "https://linkedin.com"
    },
    {
      id: "FC375D5Y1854",      name: "Izaq Zulfikar",
      role: {
        en: "Full-Stack Developer",
        id: "Full-Stack Developer"
      },
      description: {
        en: "Frontend and backend developer focused on creating responsive and intuitive user interfaces. Skilled in modern web technologies and user interface design.",
        id: "Developer frontend dan backend yang fokus pada pembuatan antarmuka pengguna yang responsif dan intuitif. Ahli di teknologi web modern dan desain antarmuka pengguna."
      },
      image: "/images/team/izaq.jpeg",
      github: "https://github.com",
      linkedin: "https://linkedin.com"
    },
    {
      id: "MC009D5Y2213",      name: "Dwi Nurcahyo Purbonegoro",
      role: {
        en: "Machine Learning Engineer",
        id: "Machine Learning Engineer"
      },
      description: {
        en: "Machine learning specialist working on data preprocessing, model training, and performance optimization for accurate waste detection and classification.",
        id: "Spesialis machine learning yang bekerja pada preprocessing data, pelatihan model, dan optimasi performa untuk deteksi dan klasifikasi sampah yang akurat."
      },
      image: "/images/team/dwi.jpeg",
      github: "https://github.com",
      linkedin: "https://linkedin.com"
    },
    {
      id: "MC009D5X2450",      name: "Clara Marsya Dekawanti",
      role: {
        en: "Machine Learning Engineer",
        id: "Machine Learning Engineer"
      },
      description: {
        en: "Focuses on model evaluation, data analysis, and implementing AI solutions for environmental sustainability. Passionate about using AI for social good.",
        id: "Fokus pada evaluasi model, analisis data, dan implementasi solusi AI untuk keberlanjutan lingkungan. Passionate tentang menggunakan AI untuk kebaikan sosial."
      },
      image: "/images/team/clara.jpeg",
      github: "https://github.com",
      linkedin: "https://linkedin.com"
    }
  ];

  const t = content[language];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {teamMembers.map((member, index) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
