import React from 'react';
import { redirect } from 'next/navigation';
import { IServerLinkDetail } from '@/types';
import { getLinkDetail } from '@/lib/db/links';
import MainLayout from '@/layouts/Main';
import DownloadView from '@/views/Download';

// Cache each rendered download page for 5 minutes on Vercel's CDN.
// The password-validation and file-access calls are still server-side API
// routes, so expiry/access control remains accurate regardless of ISR cache.
export const revalidate = 300;

const DownloadPage = async ({ params }: { params: { slug: string } }): Promise<JSX.Element> => {
  let linkInfo: IServerLinkDetail | null = null;

  try {
    const response = await getLinkDetail(params.slug);
    if (response.success) {
      linkInfo = response.data;
    } else {
      redirect('/invalid-link');
    }
  } catch {
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

export default DownloadPage;
