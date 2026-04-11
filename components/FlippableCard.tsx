"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import InvitationCard from "./InvitationCard";
import { useT } from "@/lib/localeContext";
import { InvitationDraft } from "@/lib/types";

// Leaflet은 SSR 불가 → dynamic import
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <span>지도 불러오는 중...</span>
    </div>
  ),
});

type Props = {
  draft: InvitationDraft;
  photoNoticeText?: string;
  invitationId: string;
};

function getOrCreateUserId(): string {
  try {
    const KEY = "loc-uid";
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2)}`;
  }
}

function parseEventDateTime(date: string, time: string): Date | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  let h = 0;
  let min = 0;
  if (time && /^\d{2}:\d{2}$/.test(time)) {
    [h, min] = time.split(":").map(Number);
  }
  return new Date(y, m - 1, d, h, min, 0);
}

export default function FlippableCard({ draft, photoNoticeText, invitationId }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const t = useT();

  const eventDateTime = parseEventDateTime(draft.date, draft.time);

  useEffect(() => {
    setUserId(getOrCreateUserId());
  }, []);

  function handleFlip(e: React.MouseEvent) {
    // 지도 쪽(뒷면) 클릭은 플립 무시 — 지도 조작을 허용
    if (flipped && backRef.current?.contains(e.target as Node)) return;
    setFlipped((f) => !f);
  }

  return (
    <div
      className={`flip-card${flipped ? " is-flipped" : ""}`}
      onClick={handleFlip}
      role="button"
      aria-label={flipped ? "카드 보기" : "지도 보기"}
    >
      <div className="flip-card-inner">
        {/* ── 앞면: 초대 카드 ── */}
        <div className="flip-card-face flip-card-front">
          <InvitationCard draft={draft} photoNoticeText={photoNoticeText} />
          <div className="flip-card-click-hint">Click!</div>
        </div>

        {/* ── 뒷면: 실시간 지도 ── */}
        <div className="flip-card-face flip-card-back" ref={backRef}>
          <div className="map-panel">
            <div className="map-panel-header" onClick={(e) => { e.stopPropagation(); setFlipped(false); }}>
              <span className="map-panel-title">{t.mapTitle}</span>
              <span className="map-panel-back">{t.mapBackToCard}</span>
            </div>

            {userId && (
              <MapView
                invitationId={invitationId}
                myUserId={userId}
                eventDateTime={eventDateTime}
                visible={flipped}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
