import React from 'react';
import MainLayout from '@/layouts/Main';

import { default as UploadLogoView } from '@/views/user/UploadLogo';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserLevel } from '@/utils/constants';

const UploadLogo = async (): Promise<JSX.Element> => {
  const session = await getServerSession(authOptions);
  if (session === null) {
    redirect('/signin');
  }
  
  if (session?.user.level < UserLevel.Pro) {
    redirect('/');
  }
  
  return (
    <MainLayout>
      <UploadLogoView />
    </MainLayout>
  );
};

export default UploadLogo;