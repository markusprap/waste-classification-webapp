'use client';

import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/context/auth-context';
import { ModelPreloader } from '@/components/model-preloader';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <AuthProvider>
          <ModelPreloader />
          {children}
        </AuthProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
