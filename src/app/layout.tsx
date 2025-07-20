import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import QueryProvider from './providers/QueryProvider'
import { GoogleOAuthProvider } from '@react-oauth/google'
import React, { ReactNode, Suspense } from 'react'
import ConditionalNavBar from '@/components/ui/ConditionalNavBar'
const inter = Inter({ subsets: ['latin'] });
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <QueryProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <ConditionalNavBar />
            </Suspense>
            {children}
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}