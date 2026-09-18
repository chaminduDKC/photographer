import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { getBusinessInfo } from '@/lib/api';
import { getPhotographyBusinessJsonLd } from '@/lib/seo';
import { SITE_NAME, SITE_DESCRIPTION, FALLBACK_BUSINESS } from '@/lib/fallbacks';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} | Professional Wedding & Portrait Photographer`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'wedding photographer',
    'portrait photography',
    'couple photoshoot',
    'preshoot photographer',
    'event photographer',
    'professional photo studio',
    'wedding albums',
    'photography portfolio',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SITE_NAME} | Professional Wedding & Portrait Photographer`,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Professional Wedding & Portrait Photographer`,
    description: SITE_DESCRIPTION,
  },
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
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getBusinessInfo().catch(() => FALLBACK_BUSINESS);
  const jsonLd = getPhotographyBusinessJsonLd(business, siteUrl);

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <JsonLd data={jsonLd} />
      </head>
      <body className="min-h-screen flex flex-col bg-white">
        <QueryProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
