"use client";

import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DateInput from "@/components/DateInput";
import TimeInput from "@/components/TimeInput";
import TopBannerAd from "@/components/TopBannerAd";
import { pickRandomAcceptMode } from "@/lib/acceptModes";
import { useLocale, useT } from "@/lib/localeContext";
import { initialInvitationState, saveInvitationState } from "@/lib/storage";
import { THEMES } from "@/lib/themes";
import { InvitationDraft, OccasionKey } from "@/lib/types";
import styles from "./create.module.css";

const SWIPE_THRESHOLD = 70;
const ANIMATION_MS = 220;
const CLIENT_IMAGE_MAX_SIDE = 1280;
const CLIENT_IMAGE_QUALITY = 0.82;
const MAX_UPLOAD_FILE_BYTES = 12 * 1024 * 1024;

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

function getRandomFrom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("invalid file reader result"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("failed to read file"));
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("invalid blob reader result"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("failed to load image"));
    };
    image.src = objectUrl;
  });
}

function isHeicLikeFile(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type.includes("heic") || type.includes("heif") || name.endsWith(".heic") || name.endsWith(".heif");
}

async function normalizeUploadFile(file: File): Promise<File> {
  if (!isHeicLikeFile(file)) {
    return file;
  }

  try {
    const mod = await import("heic2any");
    const converter = mod.default as (options: { blob: Blob; toType: string; quality: number }) => Promise<Blob | Blob[]>;
    const converted = await converter({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });

    const convertedBlob = Array.isArray(converted) ? converted[0] : converted;
    if (!convertedBlob) {
      throw new Error("heic-convert-empty");
    }

    return new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
  } catch {
    throw new Error("unsupported-image-type");
  }
}

async function compressImageFile(file: File): Promise<string> {
  const normalizedFile = await normalizeUploadFile(file);
  if (!normalizedFile.type.startsWith("image/")) {
    throw new Error("unsupported-image-type");
  }

  const image = await loadImageFromFile(normalizedFile);
  const longest = Math.max(image.naturalWidth, image.naturalHeight, 1);
  const ratio = Math.min(1, CLIENT_IMAGE_MAX_SIDE / longest);
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("canvas-unavailable");
  }

  context.drawImage(image, 0, 0, width, height);

  const webpBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", CLIENT_IMAGE_QUALITY);
  });

  const blob =
    webpBlob ??
    (await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", CLIENT_IMAGE_QUALITY);
    }));

    if (!blob) {
      throw new Error("blob-conversion-failed");
  }

  return blobToDataUrl(blob);
}

function daysUntilTheme(themeKey: OccasionKey, base: Date): number {
  const target = new Date(resolveThemeDate(themeKey, base));
  const baseStart = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const diff = target.getTime() - baseStart.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

export default function CreatePage() {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const now = useMemo(() => new Date(), []);

  const [draft, setDraft] = useState<InvitationDraft>(() => ({
    ...initialInvitationState.draft,
    themeKey: "promise",
    acceptMode: initialInvitationState.draft.acceptMode,
    emojis: THEMES.promise.emojis.join(" "),
    title: THEMES.promise.title,
    date: formatDate(now),
    time: formatTime(now),
    place: "",
    imageUrl: THEMES.promise.defaultImageUrl,
  }));
  const [dragX, setDragX] = useState(0);
  const [transitionMs, setTransitionMs] = useState(ANIMATION_MS);
  const [isDragging, setIsDragging] = useState(false);
  const [titleFontSize, setTitleFontSize] = useState(42);
  const [placePlaceholder, setPlacePlaceholder] = useState<string>(() => getRandomFrom(t.placePlaceholders));
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const pointerStartX = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const placeInputRef = useRef<HTMLInputElement | null>(null);

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

  const fitTitleFontSize = useCallback(() => {
    const input = titleInputRef.current;
    if (!input) {
      return;
    }

    const text = draft.title || input.placeholder || "";
    const maxWidth = input.clientWidth - 6;
    if (!text || maxWidth <= 0) {
      setTitleFontSize(42);
      return;
    }

    const computed = window.getComputedStyle(input);
    const fontFamily = computed.fontFamily;
    const fontWeight = computed.fontWeight || "400";
    const letterSpacing = Number.parseFloat(computed.letterSpacing);
    const letterSpacingPx = Number.isFinite(letterSpacing) ? letterSpacing : 0;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let nextSize = 42;
    const minSize = 22;

    while (nextSize > minSize) {
      ctx.font = `${fontWeight} ${nextSize}px ${fontFamily}`;
      const measured = ctx.measureText(text).width + Math.max(0, text.length - 1) * letterSpacingPx;
      if (measured <= maxWidth) {
        break;
      }
      nextSize -= 1;
    }

    setTitleFontSize(nextSize);
  }, [draft.title]);

  useEffect(() => {
    fitTitleFontSize();
  }, [fitTitleFontSize, draft.themeKey]);

  useEffect(() => {
    function handleResize() {
      fitTitleFontSize();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fitTitleFontSize]);

  function updateThemeByOffset(offset: number) {
    const length = orderedThemes.length;
    const nextIndex = (currentThemeIndex + offset + length) % length;
    const nextTheme = orderedThemes[nextIndex];
    const base = new Date();

    setDraft((prev) => ({
      ...prev,
      themeKey: nextTheme.key,
      emojis: nextTheme.emojis.join(" "),
      title: nextTheme.title,
      date: resolveThemeDate(nextTheme.key, base),
      time: nextTheme.key === "promise" ? formatTime(base) : prev.time,
      imageUrl: nextTheme.defaultImageUrl,
    }));

    setPlacePlaceholder(getRandomFrom(t.placePlaceholders));
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

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    if (file.size > MAX_UPLOAD_FILE_BYTES) {
      window.alert(t.alertImageTooLarge);
      return;
    }

    try {
      const dataUrl = await compressImageFile(file);
      updateField("imageUrl", dataUrl || theme.defaultImageUrl);
    } catch {
      window.alert(t.alertImageUnsupported);
    }
  }

  async function goAccept() {
    const trimmedTitle = draft.title.trim();
    if (!trimmedTitle) {
      window.alert(t.alertTitleRequired);
      titleInputRef.current?.focus();
      return;
    }

    const trimmedPlace = draft.place.trim();
    if (!trimmedPlace) {
      window.alert(t.alertPlaceRequired);
      placeInputRef.current?.focus();
      return;
    }

    try {
      const nextDraft: InvitationDraft = {
        ...draft,
        acceptMode: pickRandomAcceptMode(),
      };

      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draft: nextDraft }),
      });
      if (!res.ok) {
        let message = "failed";
        if (res.status === 413) {
          throw new Error("payload-too-large");
        }
        try {
          const errorData = (await res.json()) as { message?: string };
          message = errorData?.message || message;
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      const data = (await res.json()) as { id: string };
      if (!data?.id) {
        throw new Error("invalid id");
      }

      saveInvitationState({ draft: nextDraft, accepted: false, noAttempts: 0 });
      const nextUrl = `${window.location.origin}/accept?invite=${encodeURIComponent(data.id)}`;
      setInviteUrl(nextUrl);
      setInviteModalOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("unsupported image")) {
        window.alert(t.alertImageUnsupported);
        return;
      }
      if (message.includes("image optimize")) {
        window.alert(t.alertImageUnsupported);
        return;
      }
      if (message.includes("payload-too-large")) {
        window.alert(t.alertPayloadTooLarge);
        return;
      }
      window.alert(t.alertCreateFailed);
    }
  }

  async function copyInviteLink() {
    if (!inviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      const temp = document.createElement("textarea");
      temp.value = inviteUrl;
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.focus();
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }

    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1200);
  }

  async function shareInviteLink() {
    if (!inviteUrl) {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "초대장 링크",
          url: inviteUrl,
        });
        return;
      } catch {
        // fall back to copy
      }
    }

    await copyInviteLink();
  }

  function goPreviewWithInvite() {
    if (!inviteUrl) {
      return;
    }
    const parsed = new URL(inviteUrl);
    router.push(`${parsed.pathname}${parsed.search}`);
  }

  return (
    <main className={`mobile-shell stack ${styles.createShell}`}>
      <TopBannerAd className="ad-top" accentColor={theme.accent} />

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
              transform: dragX === 0 ? "none" : `translateX(${dragX}px) rotate(${dragX / 45}deg)`,
              transition: `transform ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <h3 className="theme-title">{t.themeLabels[draft.themeKey] ?? theme.label}</h3>

            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <input
                className="editable-card-input"
                value={draft.emojis}
                onChange={(e) => updateField("emojis", e.target.value)}
                placeholder={theme.emojis.join(" ")}
                style={{ textAlign: "center", fontSize: 26, letterSpacing: 3, paddingTop: 2, paddingBottom: 2, borderBottom: 0 }}
              />
              <input
                ref={titleInputRef}
                className={`editable-card-input title ${theme.titleClassName}`}
                value={draft.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={theme.title}
                style={{ color: theme.accent, fontSize: `${titleFontSize}px` }}
              />
            </div>

            <section className="stack" style={{ marginTop: 10 }}>
              <div className="row">
                <span className="meta-icon" aria-hidden>📅</span>
                <DateInput value={draft.date} onChange={(v) => updateField("date", v)} />
              </div>
              <div className="row">
                <span className="meta-icon" aria-hidden>🕒</span>
                <TimeInput value={draft.time} onChange={(v) => updateField("time", v)} />
              </div>
              <div className="row">
                <span className="meta-icon" aria-hidden>📍</span>
                <input
                  ref={placeInputRef}
                  className="editable-card-input"
                  value={draft.place}
                  onChange={(e) => updateField("place", e.target.value)}
                  placeholder={placePlaceholder}
                />
              </div>
            </section>

            <div className="polaroid">
              <input
                ref={fileInputRef}
                className="file-input-hidden"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              <button className="photo-upload-button" type="button" onClick={() => fileInputRef.current?.click()}>
                <img src={draft.imageUrl} alt="초대장 사진" />
              </button>
              <p className="photo-upload-hint">{t.photoHint}</p>
            </div>
          </article>
        </div>

        <button className="btn-primary" style={{ width: "100%", background: theme.accent }} onClick={goAccept}>
          {t.sendButton}
        </button>
      </section>

      {inviteModalOpen ? (
        <div className={styles.inviteModalBackdrop} onClick={() => setInviteModalOpen(false)} role="presentation">
          <section className={styles.inviteModal} onClick={(event) => event.stopPropagation()}>
            <h3 className={styles.inviteModalTitle}>{t.inviteModalTitle}</h3>
            <p className={styles.inviteModalDesc}>{t.inviteModalDesc}</p>
            <div className={styles.inviteButtons}>
              <button type="button" className="btn-secondary" onClick={copyInviteLink}>
                {t.copyLink}
              </button>
              <button type="button" className="btn-secondary" onClick={shareInviteLink}>
                {t.shareLink}
              </button>
              <button type="button" className="btn-primary" style={{ background: theme.accent }} onClick={goPreviewWithInvite}>
                {t.openPreview}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {linkCopied ? <div className="ad-copy-toast">{t.linkCopied}</div> : null}
    </main>
  );
}
