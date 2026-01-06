"use client"

import Image from "next/image"
import { useLanguage } from "@/models/language-context"

export function TechnologiesSection() {
  const { t } = useLanguage()

  const techIcons = [
    { src: "/images/tech/python.png", name: "Python", color: "from-blue-500 to-yellow-500" },
    { src: "/images/icons/atom.png", name: "React", color: "from-cyan-400 to-blue-500" },
    { src: "/images/tech/nextjs.png", name: "Next.js", color: "from-gray-700 to-gray-950" },
    { src: "/images/tech/nodejs.png", name: "Node.js", color: "from-green-500 to-emerald-600" },
  ]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-8">
            {t("tech.title").toUpperCase()}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {techIcons.map((tech, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`
                  w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center p-4 
                  border border-gray-100 shadow-sm transition-all duration-500
                  group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-gray-200 group-hover:border-transparent
                  relative overflow-hidden
                `}>
                  {/* Hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

                  <Image
                    src={tech.src || "/placeholder.svg"}
                    alt={tech.name}
                    width={48}
                    height={48}
                    className="h-10 w-10 object-contain group-hover:scale-110 transition-transform duration-500 relative z-10"
                  />
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-gray-900 transition-colors uppercase tracking-wider">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

