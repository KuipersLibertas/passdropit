import React from 'react';
import MainLayout from '@/layouts/Main';
import Script from 'next/script';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

import { default as ChooseFileView } from '@/views/create-new-link/ChooseFile';

const ChooseFile = async () => {
  const session = await getServerSession(authOptions);
  if (session === null) {
    redirect('/signin');
  }

  return (
    <MainLayout>
      <Script src="https://www.dropbox.com/static/api/1/dropins.js" id="dropboxjs" data-app-key={process.env.NEXT_PUBLIC_DROPBOX_APP_KEY} />
      <Script src="https://apis.google.com/js/api.js" id="gapijs" />
      <Script src="https://accounts.google.com/gsi/client" id="gisjs" />
      <ChooseFileView />
    </MainLayout>
  );
};

export default ChooseFile;