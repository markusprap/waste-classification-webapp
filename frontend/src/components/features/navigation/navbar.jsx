"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, User, LogIn } from "lucide-react"
import { LanguageSwitcher } from "../shared/language-switcher"
import { useLanguage } from "@/models/language-context"
import { useAuth } from "@/models/auth-context"
import AuthDialog from "@/components/features/auth/auth-dialog"
import UserDashboard from "@/components/features/auth/user-dashboard"

export function Navbar() {
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [userDashboardOpen, setUserDashboardOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleAuthClick = () => {
    if (isAuthenticated) {
      setUserDashboardOpen(true)
    } else {
      setAuthDialogOpen(true)
      }
}

const handleAuthModeSwitch = (mode) => {
  setAuthMode(mode);
};

const navLinks = [
    { href: "/", label: t("home") },
    { href: "/classify", label: t("classify") },
    { href: "/about", label: t("team") },
    { href: "/blog", label: t("blog") }
  ]
  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Image 
              src="/images/logos/recycle-logo.png" 
              alt="WasteWise AI Logo" 
              width={24} 
              height={24} 
              className="h-6 w-6" 
            />
            <span className="text-lg font-bold text-gray-900">WasteWise AI</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors duration-200 hover:text-green-600 ${
                  pathname === link.href 
                    ? "text-green-600 border-b-2 border-green-600 pb-1" 
                    : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />            <button
              onClick={handleAuthClick}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isAuthenticated ? (
                <>
                  <User className="h-4 w-4" />
                  <span>{user?.name || 'User'}</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>{t('login') || 'Login'}</span>
                </>
              )}
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <div className="block md:hidden">
              <LanguageSwitcher />
            </div>
            <button
              onClick={handleAuthClick}
              className="p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100 transition-colors duration-200"
            >
              {isAuthenticated ? (
                <User className="h-5 w-5" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 transition-colors duration-200"
              aria-expanded="false"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-green-600 bg-green-50 border-l-4 border-green-600"
                      : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <AuthDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        mode={authMode}
        onSwitchMode={handleAuthModeSwitch}
      />

      <UserDashboard
        isOpen={userDashboardOpen}
        onClose={() => setUserDashboardOpen(false)}
      />
    </header>
  )
}
