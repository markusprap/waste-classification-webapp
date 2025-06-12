import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "../src/components/providers"
import { ThemeProvider } from "../src/components/theme-provider"
import { NavigationLoader } from "../src/components/navigation-loader"
import { GlobalLoadingOverlay } from "../src/components/global-loading-overlay"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "WasteWise AI - Smart Waste Classification",
  description: "Upload an image and let our tools classify your waste into the correct category.",
  generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logos/recycle-logo-white.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <NavigationLoader />
            <GlobalLoadingOverlay />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}