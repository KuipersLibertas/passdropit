'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { UserLevel } from '@/utils/constants';

// display() for this slot is called from layout.tsx GPT init block.
// This component only renders or hides the div.
const SLOT_ID = 'passdropit_com_1000x100_sticky_anchorad_responsive';

export default function StickyAnchorAd() {
  const { data: session, status } = useSession();

  if (status !== 'loading' && (session?.user?.level ?? UserLevel.Normal) >= UserLevel.Pro) return null;

  return <div id={SLOT_ID} />;
}
