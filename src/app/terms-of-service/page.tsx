import React from 'react';
import MainLayout from '@/layouts/Main';
import { Metadata } from 'next';
import { default as TermsOfServiceView } from '@/views/TermsOfService';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the Passdropit Terms of Service to understand your rights and responsibilities when using our platform.',
  alternates: { canonical: `${SITE_URL}/terms-of-service` },
  openGraph: {
    title: 'Terms of Service — Passdropit',
    description: 'Read the Passdropit Terms of Service to understand your rights and responsibilities when using our platform.',
    url: `${SITE_URL}/terms-of-service`,
  },
};

const TermsOfService = (): JSX.Element => {
  return (
    <MainLayout>
      <TermsOfServiceView />
    </MainLayout>
  );
};

export default TermsOfService;
