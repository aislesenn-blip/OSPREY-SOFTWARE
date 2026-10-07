import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kijiko',
  description: 'Save good food. Save money.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased text-gray-900 bg-gray-50`}>
        <LanguageProvider>
          <div className="mx-auto max-w-md min-h-screen bg-white shadow-xl relative pb-20">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
