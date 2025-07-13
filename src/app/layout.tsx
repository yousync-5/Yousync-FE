import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import QueryProvider from './providers/QueryProvider'
import { GoogleOAuthProvider } from '@react-oauth/google'
import React, { ReactNode } from 'react'
import { NavBar } from '@/components/ui/NavBar'
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'YouSync - AI 더빙 연습',
  description: 'AI와 함께 더빙의 재미를 발견하세요! 실시간 피치 분석으로 완벽한 연기를 만들어보세요.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <QueryProvider>
            <NavBar />
            {children}
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}