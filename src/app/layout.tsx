import React from 'react';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import StickyAnchorAd from '@/components/StickyAnchorAd';

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
          {/* GPT — required for InArticleAdSlot and StickyAnchorAd */}
          <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" />
          {/* GPT slot initialization — defines all ad units on page load */}
          <script dangerouslySetInnerHTML={{ __html: `
            window.googletag = window.googletag || {cmd: []};
            googletag.cmd.push(function() {
              if(window.innerWidth > 1000) {
                googletag.defineSlot('/147246189,22860018223/passdropit.com_1000x100_sticky_anchorad_desktop', [[1000,100],[970,90],[728,90],[990,90],[970,50],[960,90],[950,90],[980,90]], 'passdropit_com_1000x100_sticky_anchorad_responsive').addService(googletag.pubads());
                googletag.defineSlot('/147246189,22860018223/passdropit.com_1140x280_in_article_desktop_1', [[970,250],[728,90],[970,90],[1140,280],[1100,200],[1000,200],[1000,250],[980,240],[980,120],[970,200],[970,120],[950,90],[728,100],[728,250]], 'passdropit_com_1140x280_in_article_responsive_1').addService(googletag.pubads());
              } else {
                googletag.defineSlot('/147246189,22860018223/passdropit.com_320x100_sticky_anchorad_mobile', [[320,100],[300,100],[320,50],[300,50]], 'passdropit_com_1000x100_sticky_anchorad_responsive').addService(googletag.pubads());
                googletag.defineSlot('/147246189,22860018223/passdropit.com_336x336_in_article_mobile_1', [[300,250],[336,336],[336,320],[320,320],[300,300],[336,280],[320,250],[320,336]], 'passdropit_com_1140x280_in_article_responsive_1').addService(googletag.pubads());
              }
              var interstitialSlot = googletag.defineOutOfPageSlot('/147246189,22860018223/passdropit.com_interstitial', googletag.enums.OutOfPageFormat.INTERSTITIAL);
              if (interstitialSlot) interstitialSlot.addService(googletag.pubads());
              googletag.pubads().enableSingleRequest();
              googletag.pubads().disableInitialLoad();
              googletag.enableServices();
              googletag.pubads().collapseEmptyDivs();
              googletag.display(interstitialSlot);
              googletag.display('passdropit_com_1000x100_sticky_anchorad_responsive');
              googletag.display('passdropit_com_1140x280_in_article_responsive_1');
            });
          ` }} />
          {/* Setupad prebid wrapper — provides window.stpd.initializeAdUnit and header bidding */}
          <script async src="https://stpd.cloud/saas/4179" />
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
            <StickyAnchorAd />
          </ThemeRegistry>
        </body>
      </html>
    </Providers>
  );
}
