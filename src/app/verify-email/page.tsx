import React from 'react';
import MainLayout from '@/layouts/Main';
import { Metadata } from 'next';
import VerifyEmailView from '@/views/auth/VerifyEmail';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your Passdropit email address.',
  alternates: { canonical: `${SITE_URL}/verify-email` },
  robots: { index: false },
};

const VerifyEmailPage = (): JSX.Element => (
  <MainLayout>
    <VerifyEmailView />
  </MainLayout>
);

export default VerifyEmailPage;
