'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserLevel } from '@/utils/constants';

const SLOT_ID = 'passdropit_com_1000x100_sticky_anchorad_responsive';

export default function StickyAnchorAd() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if ((session?.user?.level ?? UserLevel.Normal) >= UserLevel.Pro) return;

    window.googletag = window.googletag || { cmd: [] };
    window.googletag.cmd.push(() => {
      window.googletag.display(SLOT_ID);
    });
  }, [status, session]);

  if (status !== 'loading' && (session?.user?.level ?? UserLevel.Normal) >= UserLevel.Pro) return null;

  return <div id={SLOT_ID} />;
}
