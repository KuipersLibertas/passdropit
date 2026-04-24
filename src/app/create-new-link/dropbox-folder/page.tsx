import React from 'react';
import MainLayout from '@/layouts/Main';

import { default as ChooseDropboxFolderView } from '@/views/create-new-link/ChooseDropboxFolder';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

const ChooseDropboxFolder = async (): Promise<JSX.Element> => {
  const session = await getServerSession(authOptions);
  if (session === null) {
    redirect('/signin');
  }
  
  return (
    <MainLayout>
      <ChooseDropboxFolderView />
    </MainLayout>
  );
};

export default ChooseDropboxFolder;