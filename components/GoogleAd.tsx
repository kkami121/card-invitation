"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  slot: string;
  className?: string;
};

export default function GoogleAd({ slot, className }: Props) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client || !slot) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore duplicate push/runtime timing issues
    }
  }, [client, slot]);

  if (!client || !slot) {
    return (
      <div className={className} aria-label="ad-placeholder">
        <div className="ad-placeholder">AdSense ID 설정 후 광고가 표시됩니다.</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}