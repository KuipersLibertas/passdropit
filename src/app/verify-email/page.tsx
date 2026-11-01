import React, { Suspense } from 'react';
import MainLayout from '@/layouts/Main';
import { Metadata } from 'next';
import VerifyEmailView from '@/views/auth/VerifyEmail';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your Passdropit email address.',
  alternates: { canonical: `${SITE_URL}/verify-email` },
  robots: { index: false },
};

const VerifyEmailPage = (): JSX.Element => (
  <MainLayout>
    <Suspense>
      <VerifyEmailView />
    </Suspense>
  </MainLayout>
);

export default VerifyEmailPage;
