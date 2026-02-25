"use client";

import { type PointerEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initialInvitationState, saveInvitationState } from "@/lib/storage";
import { THEMES, defaultImageDataUrl } from "@/lib/themes";
import { InvitationDraft } from "@/lib/types";

const SWIPE_THRESHOLD = 70;
const ANIMATION_MS = 220;

export default function CreatePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<InvitationDraft>(initialInvitationState.draft);
  const [dragX, setDragX] = useState(0);
  const [transitionMs, setTransitionMs] = useState(ANIMATION_MS);
  const [isDragging, setIsDragging] = useState(false);

  const pointerStartX = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const themes = useMemo(() => Object.values(THEMES), []);
  const currentThemeIndex = Math.max(
    0,
    themes.findIndex((themeOption) => themeOption.key === draft.themeKey),
  );
  const theme = THEMES[draft.themeKey];

  function updateField<K extends keyof InvitationDraft>(key: K, value: InvitationDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function updateThemeByOffset(offset: number) {
    const length = themes.length;
    const nextIndex = (currentThemeIndex + offset + length) % length;
    updateField("themeKey", themes[nextIndex].key);
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
    if (isDragging) {
      return;
    }
    animateToTheme(offset);
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

    if (dragX < 0) {
      animateToTheme(1);
    } else {
      animateToTheme(-1);
    }

    pointerStartX.current = null;
  }

  function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : defaultImageDataUrl;
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
      <section className="paper-panel" style={{ padding: 20 }}>
        <div className="row" style={{ justifyContent: "center", marginBottom: 10 }}>
          {themes.map((themeOption, index) => (
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
            ‹
          </button>

          <button className="card-nav right" type="button" onClick={() => handleNav(1)} aria-label="다음 테마">
            ›
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
                <span aria-hidden>📅</span>
                <input
                  className="editable-card-input"
                  type="date"
                  value={draft.date}
                  onChange={(e) => updateField("date", e.target.value)}
                />
              </div>
              <div className="row">
                <span aria-hidden>🕒</span>
                <input
                  className="editable-card-input"
                  type="time"
                  value={draft.time}
                  onChange={(e) => updateField("time", e.target.value)}
                />
              </div>
              <div className="row">
                <span aria-hidden>📍</span>
                <input
                  className="editable-card-input"
                  value={draft.place}
                  onChange={(e) => updateField("place", e.target.value)}
                  placeholder="장소를 입력해 주세요"
                />
              </div>
            </section>

            <div className="polaroid">
              <img src={draft.imageUrl} alt="초대장 사진" />
              <label className="upload-inline">
                사진 바꾸기
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </article>
        </div>

        <button className="btn-primary" style={{ width: "100%", marginTop: 14 }} onClick={goAccept}>
          초대장 저장 후 열어보기
        </button>
      </section>
    </main>
  );
}
