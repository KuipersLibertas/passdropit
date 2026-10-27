'use client';

import React from 'react';
import Script from 'next/script';
import { useSession } from 'next-auth/react';
import { UserLevel } from '@/utils/constants';

interface AdSlotProps {
  tagId: string;
  // Unique name for this slot on the page — used as the Script id.
  // Required when the same tagId appears more than once on the same page.
  slotId?: string;
  style?: React.CSSProperties;
}

/**
 * Renders a Setupad ad slot.
 * Returns null for Pro/Admin users — ad-free experience is a Pro benefit.
 * Also returns null while the session is still loading to avoid a flash for Pro users.
 */
export default function AdSlot({ tagId, slotId, style }: AdSlotProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;
  if ((session?.user?.level ?? UserLevel.Normal) >= UserLevel.Pro) return null;

  const scriptId = `stpd-push-${slotId ?? tagId}`;

  return (
    <>
      <Script src="https://stpd.cloud/assets/stpdwrapper.js" strategy="afterInteractive" />
      <ins
        className="stpdwrapper"
        style={{ display: 'inline-block', ...style }}
        data-tag-id={tagId}
      />
      <Script
        id={scriptId}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: `(stpdwrapper = window.stpdwrapper || []).push({});` }}
      />
    </>
  );
}
