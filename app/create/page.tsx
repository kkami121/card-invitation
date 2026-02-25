"use client";

import { type PointerEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import GoogleAd from "@/components/GoogleAd";
import { initialInvitationState, saveInvitationState } from "@/lib/storage";
import { THEMES } from "@/lib/themes";
import { InvitationDraft, OccasionKey } from "@/lib/types";

const SWIPE_THRESHOLD = 70;
const ANIMATION_MS = 220;
const PLACE_PLACEHOLDERS = ["홍대입구역", "성수역", "여의도한강공원", "잠실 롯데월드몰", "광화문 광장"];

const THEME_MONTH_DAY: Partial<Record<OccasionKey, { month: number; day: number }>> = {
  "childrens-day": { month: 5, day: 5 },
  "samgyeopsal-day": { month: 3, day: 3 },
  "white-day": { month: 3, day: 14 },
  valentine: { month: 2, day: 14 },
  pepero: { month: 11, day: 11 },
  christmas: { month: 12, day: 25 },
  "lunar-new-year": { month: 2, day: 17 },
  chuseok: { month: 9, day: 25 },
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getRandomPlacePlaceholder(): string {
  return PLACE_PLACEHOLDERS[Math.floor(Math.random() * PLACE_PLACEHOLDERS.length)];
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
}

function getNextDateFromMonthDay(base: Date, month: number, day: number): Date {
  const candidate = new Date(base.getFullYear(), month - 1, day);
  const baseStart = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  if (candidate < baseStart) {
    return new Date(base.getFullYear() + 1, month - 1, day);
  }
  return candidate;
}

function resolveThemeDate(themeKey: OccasionKey, base: Date): string {
  if (themeKey === "promise") {
    return formatDate(base);
  }
  if (themeKey === "weekend-date") {
    return formatDate(addDays(base, 1));
  }
  if (themeKey === "birthday") {
    return formatDate(addDays(base, 2));
  }

  const monthDay = THEME_MONTH_DAY[themeKey];
  if (!monthDay) {
    return formatDate(base);
  }
  return formatDate(getNextDateFromMonthDay(base, monthDay.month, monthDay.day));
}

function daysUntilTheme(themeKey: OccasionKey, base: Date): number {
  const target = new Date(resolveThemeDate(themeKey, base));
  const baseStart = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const diff = target.getTime() - baseStart.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

export default function CreatePage() {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);

  const [draft, setDraft] = useState<InvitationDraft>(() => ({
    ...initialInvitationState.draft,
    themeKey: "promise",
    title: THEMES.promise.title,
    date: formatDate(now),
    time: formatTime(now),
    place: "",
    imageUrl: THEMES.promise.defaultImageUrl,
  }));
  const [dragX, setDragX] = useState(0);
  const [transitionMs, setTransitionMs] = useState(ANIMATION_MS);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [placePlaceholder, setPlacePlaceholder] = useState<string>(() => getRandomPlacePlaceholder());

  const pointerStartX = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const orderedThemes = useMemo(() => {
    const allThemes = Object.values(THEMES);
    const promiseTheme = allThemes.find((themeOption) => themeOption.key === "promise");
    const sortedByNear = allThemes
      .filter((themeOption) => themeOption.key !== "promise")
      .sort((a, b) => daysUntilTheme(a.key, now) - daysUntilTheme(b.key, now));

    if (!promiseTheme) {
      return sortedByNear;
    }

    const splitIndex = Math.ceil(sortedByNear.length / 2);
    const rightSide = sortedByNear.slice(0, splitIndex);
    const leftSide = sortedByNear.slice(splitIndex);
    return [...leftSide, promiseTheme, ...rightSide];
  }, [now]);

  const currentThemeIndex = Math.max(0, orderedThemes.findIndex((themeOption) => themeOption.key === draft.themeKey));
  const theme = THEMES[draft.themeKey];

  function updateField<K extends keyof InvitationDraft>(key: K, value: InvitationDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function updateThemeByOffset(offset: number) {
    const length = orderedThemes.length;
    const nextIndex = (currentThemeIndex + offset + length) % length;
    const nextTheme = orderedThemes[nextIndex];
    const base = new Date();

    setDraft((prev) => ({
      ...prev,
      themeKey: nextTheme.key,
      title: nextTheme.title,
      date: resolveThemeDate(nextTheme.key, base),
      time: nextTheme.key === "promise" ? formatTime(base) : prev.time,
      imageUrl: nextTheme.defaultImageUrl,
    }));

    setSelectedFileName(null);
    setPlacePlaceholder(getRandomPlacePlaceholder());
  }

  function animateToTheme(offset: 1 | -1) {
    const width = viewportRef.current?.offsetWidth ?? 320;
    const outX = offset === 1 ? -width * 1.1 : width * 1.1;
    const inX = offset === 1 ? width * 0.55 : -width * 0.55;

    setTransitionMs(ANIMATION_MS);
    setDragX(outX);

    window.setTimeout(() => {
      updateThemeByOffset(offset);
      setTransitionMs(0);
      setDragX(inX);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionMs(ANIMATION_MS);
          setDragX(0);
        });
      });
    }, ANIMATION_MS);
  }

  function handleNav(offset: 1 | -1) {
    if (!isDragging) {
      animateToTheme(offset);
    }
  }

  function isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    return Boolean(target.closest("input, button, select, textarea, label"));
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (isInteractiveTarget(event.target)) {
      return;
    }
    pointerStartX.current = event.clientX;
    setIsDragging(true);
    setTransitionMs(0);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!isDragging || pointerStartX.current === null) {
      return;
    }
    setDragX(event.clientX - pointerStartX.current);
  }

  function handlePointerUp() {
    if (!isDragging) {
      return;
    }

    setIsDragging(false);

    if (Math.abs(dragX) < SWIPE_THRESHOLD) {
      setTransitionMs(ANIMATION_MS);
      setDragX(0);
      pointerStartX.current = null;
      return;
    }

    animateToTheme(dragX < 0 ? 1 : -1);
    pointerStartX.current = null;
  }

  function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : theme.defaultImageUrl;
      updateField("imageUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function goAccept() {
    saveInvitationState({ draft, accepted: false, noAttempts: 0 });
    router.push("/accept");
  }

  return (
    <main className="mobile-shell stack">
      <GoogleAd slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP ?? ""} className="ad-top" />

      <section className="paper-panel" style={{ padding: "20px 20px 15px" }}>
        <div className="row" style={{ justifyContent: "center", marginBottom: 10 }}>
          {orderedThemes.map((themeOption, index) => (
            <span
              key={themeOption.key}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                display: "inline-block",
                background: index === currentThemeIndex ? theme.accent : "#d7ccbd",
              }}
            />
          ))}
        </div>

        <div className="card-carousel" ref={viewportRef}>
          <button className="card-nav left" type="button" onClick={() => handleNav(-1)} aria-label="이전 테마">
            <span>‹</span>
          </button>
          <button className="card-nav right" type="button" onClick={() => handleNav(1)} aria-label="다음 테마">
            <span>›</span>
          </button>

          <article
            className="invitation-card"
            style={{
              transform: `translateX(${dragX}px) rotate(${dragX / 45}deg)`,
              transition: `transform ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <h3 className="theme-title">{theme.label}</h3>

            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 26, letterSpacing: 3 }}>{theme.emojis.join(" ")}</p>
              <input
                className={`editable-card-input title ${theme.titleClassName}`}
                value={draft.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={theme.title}
                style={{ color: theme.accent }}
              />
            </div>

            <section className="stack" style={{ marginTop: 14 }}>
              <div className="row">
                <span className="meta-icon" aria-hidden>📅</span>
                <input className="editable-card-input" type="date" value={draft.date} onChange={(e) => updateField("date", e.target.value)} />
              </div>
              <div className="row">
                <span className="meta-icon" aria-hidden>🕒</span>
                <input className="editable-card-input" type="time" value={draft.time} onChange={(e) => updateField("time", e.target.value)} />
              </div>
              <div className="row">
                <span className="meta-icon" aria-hidden>📍</span>
                <input className="editable-card-input" value={draft.place} onChange={(e) => updateField("place", e.target.value)} placeholder={placePlaceholder} />
              </div>
            </section>

            <div className="polaroid">
              <img src={draft.imageUrl} alt="초대장 사진" />
              <div className="upload-inline">
                <input
                  ref={fileInputRef}
                  className="file-input-hidden"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
                <button className="upload-trigger" type="button" onClick={() => fileInputRef.current?.click()}>
                  사진 업로드
                </button>
                {selectedFileName ? <span className="upload-file-name">{selectedFileName}</span> : null}
              </div>
            </div>
          </article>
        </div>

        <button className="btn-primary" style={{ width: "100%", background: theme.accent }} onClick={goAccept}>
          초대장 저장 후 열어보기
        </button>
      </section>
    </main>
  );
}