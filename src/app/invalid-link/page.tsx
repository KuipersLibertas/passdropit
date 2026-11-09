import MainLayout from '@/layouts/Main';
import { Metadata } from 'next';
import React from 'react';
import { default as InvalidLinkView } from '@/views/InvalidLink';

// Shown for missing/expired links: keep it out of Google's index.
export const metadata: Metadata = { robots: { index: false, follow: false } };

const InvalidLink = (): JSX.Element => {
  return (
    <MainLayout mode={2}>
      <InvalidLinkView />
    </MainLayout>
  );
};

export default InvalidLink;