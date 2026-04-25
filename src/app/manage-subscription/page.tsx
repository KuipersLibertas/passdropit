import React from 'react';
import MainLayout from '@/layouts/Main';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { default as ManageSubScriptionView } from '@/views/ManageSubScription';
import { redirect } from 'next/navigation';
import { getSubscription } from '@/lib/db/user';

const ManageSubScription = async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/signin');

  let url = '';
  try {
    const response = await getSubscription(session.user.id as number);
    url = response.url ?? '';
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
