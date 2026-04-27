import React from 'react';
import MainLayout from '@/layouts/Main';
import { Metadata } from 'next';
import { default as PrivacyPolicyView } from '@/views/PrivacyPolicy';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the Passdropit Privacy Policy to understand how we collect, use, and protect your data.',
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  openGraph: {
    title: 'Privacy Policy — Passdropit',
    description: 'Read the Passdropit Privacy Policy to understand how we collect, use, and protect your data.',
    url: `${SITE_URL}/privacy-policy`,
  },
};

const PrivacyPolicy = (): JSX.Element => {
  return (
    <MainLayout>
      <PrivacyPolicyView />
    </MainLayout>
  );
};

export default PrivacyPolicy;
