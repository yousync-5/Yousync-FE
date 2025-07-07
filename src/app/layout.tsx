//이해완료
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import QueryProvider from './providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouSync - AI 더빙 연습',
  description: 'AI와 함께 더빙의 재미를 발견하세요! 실시간 피치 분석으로 완벽한 연기를 만들어보세요.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
} 