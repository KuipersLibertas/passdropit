import React from 'react';
import MainLayout from '@/layouts/Main';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { default as ManageSubScriptionView } from '@/views/ManageSubScription';
import { redirect } from 'next/navigation';
import { getSubscription } from '@/api';

const ManageSubScription = async () => {
  const session = await getServerSession(authOptions);

  if (session === null) {
    redirect('/signin');
  }

  let url = '';
  try {
    const response = await getSubscription();
    url = response.url;
  } catch (error) {
    console.log(error);
  }
  
  return (
    <MainLayout>
      <ManageSubScriptionView url={url} />
    </MainLayout>
  );
};

export default ManageSubScription;