import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://haziralici.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'haziralici.com — Türkiye’nin Tersine Pazar Yeri',
    template: '%s | haziralici.com',
  },
  description: 'Alıcılar ne aradıklarını ve bütçelerini ilan eder; satıcılar gizli teklifler sunar. Sıfır komisyonlu tersine alışveriş platformu.',
  keywords: [
    'tersine pazar yeri',
    'alıcı ilanı',
    'teklif al',
    'hazır alıcı',
    'ikinci el alım',
    'gayrimenkul arıyorum',
    'vasıta arıyorum',
    'bütçeli alıcılar',
  ],
  authors: [{ name: 'haziralici.com' }],
  creator: 'haziralici.com',
  publisher: 'haziralici.com',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    siteName: 'haziralici.com',
    title: 'haziralici.com — Türkiye’nin Tersine Pazar Yeri',
    description: 'Alıcılar ne aradıklarını ve bütçelerini ilan eder; satıcılar gizli teklifler sunar.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'haziralici.com Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'haziralici.com — Türkiye’nin Tersine Pazar Yeri',
    description: 'Alıcılar ne aradıklarını ve bütçelerini ilan eder; satıcılar gizli teklifler sunar.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#312E81',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col selection:bg-[#312E81] selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6">
            {children}
          </main>
          <div className="pb-16 sm:pb-0">
            <Footer />
          </div>
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
