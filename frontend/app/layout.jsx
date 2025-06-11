import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "../src/components/providers"
import { ThemeProvider } from "../src/components/theme-provider"
import { NavigationLoader } from "../src/components/navigation-loader"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "WasteWise AI - Smart Waste Classification",
  description: "Upload an image and let our tools classify your waste into the correct category.",
  generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <NavigationLoader />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}