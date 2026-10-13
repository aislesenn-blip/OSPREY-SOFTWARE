import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { LanguageProvider } from '@/lib/i18n'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Whemsy - Campus Food Subscription',
  description: "Fresh, filling meals ready for you on campus. Subscribe and save.",
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#E85D04',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
