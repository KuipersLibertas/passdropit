import React from 'react';
import MainLayout from '@/layouts/Main';
import { Metadata } from 'next';
import { default as SignInView } from '@/views/auth/SignIn';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Passdropit account to manage your password-protected file links.',
  alternates: { canonical: `${SITE_URL}/signin` },
};

const SignIn = async (): Promise<JSX.Element> => {
  const session = await getServerSession(authOptions);
  if (session !== null) redirect('/');

  return (
    <MainLayout>
      <SignInView />
    </MainLayout>
  );
};

export default SignIn;
