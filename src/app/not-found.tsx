import MainLayout from '@/layouts/Main';
import React from 'react';
import { Metadata } from 'next';
import { default as Custom404View } from '@/views/Custom404';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

const NotFound = (): JSX.Element => {
  return (
    <MainLayout>
      <Custom404View />
    </MainLayout>
  );
};

export default NotFound;
