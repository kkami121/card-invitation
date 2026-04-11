"use client";

import { type SyntheticEvent, useMemo, useRef } from "react";
import { useLocale, useT } from "@/lib/localeContext";
import { THEMES } from "@/lib/themes";
import { InvitationDraft } from "@/lib/types";

type Props = {
  draft: InvitationDraft;
  photoNoticeText?: string;
};

/**
 * locale에 맞는 날짜 문자열을 반환합니다.
 * 예) ko → "2026년 4월 11일 토요일"
 *     en → "Saturday, April 11, 2026"
 *     ja → "2026年4月11日土曜日"
 *     zh → "2026年4月11日星期六"
 */
function formatDisplayDate(raw: string, locale: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
  } catch {
    return null;
  }
}

/**
 * locale에 맞는 시간 문자열을 반환합니다.
 * 예) ko → "오전 9:30"
 *     en → "9:30 AM"
 *     ja → "午前9:30"
 *     zh → "上午9:30"
 */
function formatDisplayTime(raw: string, locale: string): string | null {
  const match = /^(\d{2}):(\d{2})$/.exec(raw);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  const date = new Date(2000, 0, 1, hour, minute);

  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return null;
  }
}

export default function InvitationCard({ draft, photoNoticeText }: Props) {
  const locale = useLocale();
  const t = useT();
  const theme = THEMES[draft.themeKey];
  const formattedDate = draft.date ? formatDisplayDate(draft.date, locale) : null;
  const formattedTime = draft.time ? formatDisplayTime(draft.time, locale) : null;
  const retryCountRef = useRef(0);
  const cacheSeedRef = useRef(Date.now());
  const isUploadedImage = draft.imageUrl.startsWith("/uploads/") || draft.imageUrl.startsWith("/api/uploads/");
  const imageSrc = useMemo(() => {
    if (!isUploadedImage) {
      return draft.imageUrl;
    }
    const separator = draft.imageUrl.includes("?") ? "&" : "?";
    return `${draft.imageUrl}${separator}v=${cacheSeedRef.current}`;
  }, [draft.imageUrl, isUploadedImage]);

  function handleImageError(event: SyntheticEvent<HTMLImageElement, Event>) {
    if (!isUploadedImage) {
      return;
    }
    if (retryCountRef.current >= 4) {
      return;
    }

    retryCountRef.current += 1;
    const target = event.currentTarget;
    const separator = draft.imageUrl.includes("?") ? "&" : "?";
    window.setTimeout(() => {
      target.src = `${draft.imageUrl}${separator}retry=${Date.now()}`;
    }, retryCountRef.current * 500);
  }

  return (
    <article className="paper-panel" style={{ padding: "20px 20px 10px" }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 26, letterSpacing: 3 }}>{draft.emojis || theme.emojis.join(" ")}</p>
        <h1 className={theme.titleClassName} style={{ color: theme.accent, fontSize: 44, margin: "8px 0 0" }}>
          {draft.title || theme.title}
        </h1>
      </div>

      <section className="stack" style={{ marginTop: 10, gap: 2 }}>
        <div className="row invitation-meta-row">
          <span aria-hidden>📅</span>
          <p className="meta-text">{formattedDate ?? t.datePlaceholder}</p>
        </div>
        <div className="row invitation-meta-row">
          <span aria-hidden>🕒</span>
          <p className="meta-text">{formattedTime ?? t.timePlaceholder}</p>
        </div>
        <div className="row invitation-meta-row">
          <span aria-hidden>📍</span>
          <p className="meta-text">{draft.place || t.placePlaceholder}</p>
        </div>
      </section>

      <div className="polaroid" style={{ marginTop: 5 }}>
        <img src={imageSrc} alt="초대장 사진" onError={handleImageError} />
      </div>
      {photoNoticeText ? (
        <p className="photo-upload-hint" style={{ textAlign: "center", marginTop: 6 }}>
          {photoNoticeText}
        </p>
      ) : null}
    </article>
  );
}
