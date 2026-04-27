import React from 'react';
import MainLayout from '@/layouts/Main';
import { Metadata } from 'next';
import { default as AboutUsView } from '@/views/AboutUs';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Passdropit — the secure file link sharing service built for Dropbox, Google Drive, and Notion users who care about privacy.',
  alternates: { canonical: `${SITE_URL}/about-us` },
  openGraph: {
    title: 'About Us — Passdropit',
    description: 'Learn about Passdropit — the secure file link sharing service built for Dropbox, Google Drive, and Notion users who care about privacy.',
    url: `${SITE_URL}/about-us`,
  },
};

const AboutUs = (): JSX.Element => {
  return (
    <MainLayout>
      <AboutUsView />
    </MainLayout>
  );
};

export default AboutUs;
