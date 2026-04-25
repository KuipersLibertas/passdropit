import React from 'react';

import DownloadView from '@/views/Download';
import { redirect } from 'next/navigation';
import { IServerLinkDetail } from '@/types';
import { getLinkDetail } from '@/lib/db/links';
import MainLayout from '@/layouts/Main';

const ValidationCheck = async ({ params }: { params: { slug: string } }): Promise<JSX.Element> => {
  let linkInfo: IServerLinkDetail|null = null;

  try {
    const response = await getLinkDetail(params.slug);
    if (response.success) {
      linkInfo = response.data;
    } else {
      redirect('/invalid-link');
    }
  } catch (error) {
    redirect('/invalid-link');
  }

  if (linkInfo === null) {
    redirect('/invalid-link');
  }
  
  return (
    <MainLayout mode={2}>
      <DownloadView linkInfo={linkInfo!} />
    </MainLayout>
  );
};

export default ValidationCheck;