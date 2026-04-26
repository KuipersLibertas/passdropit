import React from 'react';
import MainLayout from '@/layouts/Main';
import Script from 'next/script';

import { default as ManageLinkView } from '@/views/ManageLink';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getLinkList } from '@/lib/db/links';

const ManageLink = async (): Promise<JSX.Element> => {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/signin');

  let linkList: any[] = [];
  try {
    linkList = await getLinkList(session.user.id as number);
  } catch (error) {
    console.log(error);
  }

  return (
    <MainLayout>
      <Script src="https://www.dropbox.com/static/api/1/dropins.js" id="dropboxjs" data-app-key={process.env.NEXT_PUBLIC_DROPBOX_APP_KEY} />
      <Script src="https://apis.google.com/js/api.js" />
      <ManageLinkView data={linkList} />
    </MainLayout>
  );
};

export default ManageLink;
