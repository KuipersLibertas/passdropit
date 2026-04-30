import React from 'react';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/redux/Providers';

import './globals.css';
import 'aos/dist/aos.css';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Passdropit — Password-Protect Your Dropbox, Google Drive & Notion Links',
    template: '%s — Passdropit',
  },
  description:
    'Passdropit lets you share Dropbox, Google Drive, and Notion files with password protection, expiry dates, download limits, and IP tracking. Free and Pro plans available.',
  keywords: [
    'password protect dropbox link',
    'password protect google drive link',
    'password protect notion link',
    'secure file sharing',
    'password protected download link',
    'expiring file link',
    'dropbox password',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Passdropit',
    title: 'Passdropit — Password-Protect Your Dropbox, Google Drive & Notion Links',
    description:
      'Share files securely with password protection, expiry dates, download limits, and IP tracking.',
    images: [
      {
        url: '/assets/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Passdropit — Secure File Link Sharing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Passdropit — Password-Protect Your File Links',
    description: 'Share Dropbox, Google Drive, and Notion links with password protection and expiry.',
    images: ['/assets/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <html lang="en">
        <head>
          <script src="https://cmp.setupcmp.com/cmp/cmp/cmp-stub.js" data-prop-id="6396" />
          <script src="https://cmp.setupcmp.com/cmp/cmp/cmp-v1.js" data-prop-stpd-cmp-id="6396" async />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([
                {
                  '@context': 'https://schema.org',
                  '@type': 'Organization',
                  name: 'Passdropit',
                  url: SITE_URL,
                  logo: `${SITE_URL}/assets/images/logo.png`,
                  contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    email: 'support@passdropit.com',
                  },
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'WebSite',
                  name: 'Passdropit',
                  url: SITE_URL,
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'SoftwareApplication',
                  name: 'Passdropit',
                  applicationCategory: 'BusinessApplication',
                  operatingSystem: 'Web',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                  },
                },
              ]),
            }}
          />
        </head>
        <body className={inter.className}>
          <ToastContainer
            position="bottom-center"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <ThemeRegistry>
            {children}
          </ThemeRegistry>
        </body>
      </html>
    </Providers>
  );
}
