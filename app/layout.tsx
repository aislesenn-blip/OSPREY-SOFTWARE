import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { LanguageProvider } from '@/lib/i18n'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Kijiko - Save Food, Save Money',
  description: "Tanzania's food surplus marketplace. Good food at better prices.",
  manifest: '/manifest.json',
  themeColor: '#E85D04',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <LanguageProvider>
          <div className="mx-auto min-h-screen max-w-md bg-white shadow-xl flex flex-col relative overflow-hidden">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}
