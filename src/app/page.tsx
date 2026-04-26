import React from 'react';
import Script from 'next/script';
import Link from 'next/link';
import MainLayout from '@/layouts/Main';

import { default as HomeView } from '@/views/Home';

const Home = (): JSX.Element => {
  return (
    <MainLayout>
      <Link rel="preload" as="script" href="https://live.demand.supply/up.js" /><Script async data-cfasync="false" type="text/javascript" src="https://live.demand.supply/up.js" />
      <Script type="text/javascript" async src="https://copyrightcontent.org/ub/ub.js?ai=66462a7402ec5a11c212787f" />
      <Script src="https://www.dropbox.com/static/api/1/dropins.js" id="dropboxjs" data-app-key={process.env.NEXT_PUBLIC_DROPBOX_APP_KEY} />
      <HomeView />
    </MainLayout>
  );
};

export default Home;