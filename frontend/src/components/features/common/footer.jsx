"use client"

import Link from "next/link"
import { Mail, Phone, Instagram, Twitter, Facebook, Github } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/context/language-context"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 py-12 text-white md:py-16">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          <div>
            <div className="flex items-center space-x-2">
              <Image src="/images/recycle-logo-white.png" alt="WasteWise AI Logo" width={24} height={24} className="h-6 w-6" />
              <span className="text-lg font-bold">WasteWise AI</span>
            </div>
            <p className="mt-4 text-gray-400">{t("footer.tagline")}</p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">{t("footer.quickLinks")}</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-400 hover:text-white">
                {t("home")}
              </Link>
              <Link href="/classify" className="text-gray-400 hover:text-white">
                {t("classify")}
              </Link>
              <Link href="/team" className="text-gray-400 hover:text-white">
                {t("team")}
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">{t("footer.contact")}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-5 w-5" />
                <span>info@wastewiseai.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-5 w-5" />
                <span>+82 8184 5463 663</span>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          © Waste Wise AI | CC25-CP053 Team Coding Camp 2025. All right reserved.
        </div>
      </div>
    </footer>
  )
}
