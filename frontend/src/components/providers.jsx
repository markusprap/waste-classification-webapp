"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "../models/auth-context"
import { LanguageProvider } from "../models/language-context"
import { MidtransProvider } from "./features/payment/midtrans-provider"
import { LoadingProvider } from "../models/loading-context"

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session} refetchInterval={0} refetchOnWindowFocus={false}>
      <AuthProvider>
        <LanguageProvider>
          <LoadingProvider>
            <MidtransProvider>
              {children}
            </MidtransProvider>
          </LoadingProvider>
        </LanguageProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
