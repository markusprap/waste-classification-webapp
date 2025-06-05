// filepath: d:\PROJECTS\Coding Camp 2025 powered by DBS Foundation\Capstone\waste-classification-webapp\app\layout.jsx
import "@/app/globals.css"
import { Inter } from "next/font/google"

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
        {children}
      </body>
    </html>
  )
}
