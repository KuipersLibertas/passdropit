import React from 'react';
import MainLayout from '@/layouts/Main';
import { Metadata } from 'next';
import { default as SignUpView } from '@/views/auth/SignUp';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a free Passdropit account and start sharing Dropbox, Google Drive, and Notion files with password protection and expiry dates.',
  alternates: { canonical: `${SITE_URL}/signup` },
};

const SignUp = async (): Promise<JSX.Element> => {
  const session = await getServerSession(authOptions);
  if (session !== null) redirect('/');

  return (
    <MainLayout>
      <SignUpView />
    </MainLayout>
  );
};

export default SignUp;
