'use client';

/**
 * InArticleAdSlot — Setupad GPT-based in-content ad units.
 *
 * Three variants matching the tags Setupad provided:
 *   variant=1  Immediate display (slot defined by Setupad's prebid wrapper on init)
 *   variant=2  Lazy-loaded on viewport entry, responsive desktop/mobile  ← use for "above content"
 *   variant=3  Lazy-loaded repeat unit with unique ID per instance        ← use for "below content" / repeats
 *
 * Prerequisites (loaded via layout.tsx):
 *   - GPT:  https://securepubads.g.doubleclick.net/tag/js/gpt.js
 *   - GPT init block: defines slot IDs and calls enableServices/disableInitialLoad
 *   - Setupad prebid wrapper: https://stpd.cloud/saas/4179
 *     (provides window.stpd.initializeAdUnit and Setupad's header bidding setup)
 */

import React, { useEffect, useId, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { UserLevel } from '@/utils/constants';

declare global {
  interface Window {
    googletag: {
      cmd: Array<() => void>;
      pubads: () => object;
      defineSlot: (path: string, sizes: number[][], id: string) => { addService: (s: object) => object };
      display: (id: string) => void;
    };
    stpd: { initializeAdUnit: (id: string) => void };
  }
}

type SlotVariant = 1 | 2 | 3;

interface Props {
  variant: SlotVariant;
}

// ─── Setupad-provided ad unit configuration ────────────────────────────────

const NETWORK = '/147246189,22860018223';

const SLOT_1_ID = 'passdropit_com_1140x280_in_article_responsive_1';
const SLOT_2_ID = 'passdropit_com_1140x280_in_article_responsive_lazy_2';

const DESKTOP_SIZES: number[][] = [
  [970,250],[728,90],[970,90],[1140,280],[1100,200],[1000,200],[1000,250],
  [980,240],[980,120],[970,200],[970,120],[950,90],[728,100],[728,250],
];
const MOBILE_SIZES: number[][] = [
  [300,250],[336,336],[336,320],[320,320],[300,300],[336,280],[320,250],[320,336],
];

// ──────────────────────────────────────────────────────────────────────────

export default function InArticleAdSlot({ variant }: Props) {
  const { data: session, status } = useSession();
  const uid = useId();
  const stableSlotId = useRef<string>(
    variant === 3
      ? `stpd-${uid.replace(/[^a-z0-9]/gi, '')}`
      : variant === 2
        ? SLOT_2_ID
        : SLOT_1_ID,
  );
  const initialized = useRef(false);

  useEffect(() => {
    // Wait until session has resolved so we know if user is Pro
    if (status === 'loading') return;
    if ((session?.user?.level ?? UserLevel.Normal) >= UserLevel.Pro) return;
    // Prevent double-init across re-renders (e.g. token refresh)
    if (initialized.current) return;
    initialized.current = true;

    const slotId = stableSlotId.current;
    window.googletag = window.googletag || { cmd: [] };
    const gt = window.googletag;

    // Variant 1: slot pre-defined by layout.tsx GPT init; just call display
    if (variant === 1) {
      gt.cmd.push(() => gt.display(SLOT_1_ID));
      return;
    }

    // Variants 2 and 3: lazy — fire when slot enters the viewport
    const el = document.getElementById(slotId);
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const isDesktop = variant === 3 ? window.innerWidth >= 1000 : window.innerWidth > 1199;
        const adPath =
          variant === 2
            ? isDesktop
              ? `${NETWORK}/passdropit.com_1140x280_in_article_desktop_lazy_2`
              : `${NETWORK}/passdropit.com_336x336_in_article_mobile_lazy_2`
            : isDesktop
              ? `${NETWORK}/passdropit.com_1140x280_in_article_desktop_lazy_repeat_3`
              : `${NETWORK}/passdropit.com_336x336_in_article_mobile_lazy_repeat_3`;

        gt.cmd.push(() => {
          gt.defineSlot(adPath, isDesktop ? DESKTOP_SIZES : MOBILE_SIZES, slotId)
            .addService(gt.pubads());
          gt.display(slotId);
          window.stpd?.initializeAdUnit(slotId);
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [status, session, variant]);

  // Render the div during session load so it's in the DOM when the effect fires.
  // Only hide for confirmed Pro/Admin users.
  if (status !== 'loading' && (session?.user?.level ?? UserLevel.Normal) >= UserLevel.Pro) return null;

  return (
    <div
      id={stableSlotId.current}
      style={{ textAlign: 'center', minHeight: variant === 1 ? 100 : 0 }}
    />
  );
}
