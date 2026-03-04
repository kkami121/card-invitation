"use client";

import { Suspense, type MouseEvent, type PointerEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadInvitationState, saveInvitationState } from "@/lib/storage";
import { THEMES } from "@/lib/themes";
import { InvitationDraft } from "@/lib/types";

const NO_BUTTON_WIDTH = 120;
const NO_BUTTON_HEIGHT = 44;
const EDGE_PADDING = 12;
const MIN_MOVE_PX = 120;
const MAX_MOVE_PX = 200;
const POINTER_SAFE_RADIUS = 96;
const YES_SAFE_MARGIN = 18;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function overlaps(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function AcceptPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [ready, setReady] = useState(false);
  const [noAttempts, setNoAttempts] = useState(0);
  const [noFloating, setNoFloating] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const panelRef = useRef<HTMLElement | null>(null);
  const yesButtonRef = useRef<HTMLButtonElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    async function init() {
      try {
        if (inviteToken) {
          const res = await fetch(`/api/invitations/${encodeURIComponent(inviteToken)}`);
          if (res.ok) {
            const payload = (await res.json()) as {
              draft: InvitationDraft;
            };
            if (payload?.draft) {
              const theme = THEMES[payload.draft.themeKey] ?? THEMES.promise;
              saveInvitationState({
                draft: {
                  ...payload.draft,
                  emojis: payload.draft.emojis || theme.emojis.join(" "),
                },
                accepted: false,
                noAttempts: 0,
              });
              setNoAttempts(0);
              return;
            }
          }
        }

        const state = loadInvitationState();
        setNoAttempts(state.noAttempts);
      } catch {
        setNoAttempts(0);
      } finally {
        setReady(true);
      }
    }

    init();
  }, [inviteToken]);

  function setInitialFloatingFromDom() {
    const panel = panelRef.current;
    const noButton = noButtonRef.current;
    if (!panel || !noButton) {
      return;
    }

    const panelRect = panel.getBoundingClientRect();
    const noRect = noButton.getBoundingClientRect();
    setPosition({
      left: Math.round(noRect.left - panelRect.left),
      top: Math.round(noRect.top - panelRect.top),
    });
  }

  function randomizeNoButton(pointer?: { x: number; y: number }) {
    setPosition((prev) => {
      const panel = panelRef.current;
      if (!panel) {
        return prev;
      }

      const minLeft = EDGE_PADDING;
      const minTop = EDGE_PADDING;
      const maxLeft = Math.max(minLeft, panel.clientWidth - NO_BUTTON_WIDTH - EDGE_PADDING);
      const maxTop = Math.max(minTop, panel.clientHeight - NO_BUTTON_HEIGHT - EDGE_PADDING);
      const panelRect = panel.getBoundingClientRect();

      let yesSafeZone:
        | { left: number; top: number; right: number; bottom: number }
        | null = null;

      if (yesButtonRef.current) {
        const yesRect = yesButtonRef.current.getBoundingClientRect();
        yesSafeZone = {
          left: yesRect.left - panelRect.left - YES_SAFE_MARGIN,
          top: yesRect.top - panelRect.top - YES_SAFE_MARGIN,
          right: yesRect.right - panelRect.left + YES_SAFE_MARGIN,
          bottom: yesRect.bottom - panelRect.top + YES_SAFE_MARGIN,
        };
      }

      const pointerLocal = pointer
        ? {
            x: pointer.x - panelRect.left,
            y: pointer.y - panelRect.top,
          }
        : null;

      for (let i = 0; i < 120; i += 1) {
        const nextLeft = minLeft + Math.random() * (maxLeft - minLeft);
        const nextTop = minTop + Math.random() * (maxTop - minTop);
        const moved = Math.hypot(nextLeft - prev.left, nextTop - prev.top);
        if (moved < MIN_MOVE_PX || moved > MAX_MOVE_PX) {
          continue;
        }

        const nextRect = {
          left: nextLeft,
          top: nextTop,
          right: nextLeft + NO_BUTTON_WIDTH,
          bottom: nextTop + NO_BUTTON_HEIGHT,
        };

        if (yesSafeZone && overlaps(nextRect, yesSafeZone)) {
          continue;
        }

        if (pointerLocal) {
          const nearestX = clamp(pointerLocal.x, nextRect.left, nextRect.right);
          const nearestY = clamp(pointerLocal.y, nextRect.top, nextRect.bottom);
          const pointerDistance = Math.hypot(pointerLocal.x - nearestX, pointerLocal.y - nearestY);
          if (pointerDistance < POINTER_SAFE_RADIUS) {
            continue;
          }
        }

        return { left: Math.round(nextLeft), top: Math.round(nextTop) };
      }

      return {
        left: prev.left < panel.clientWidth / 2 ? Math.round(maxLeft) : Math.round(minLeft),
        top: prev.top < panel.clientHeight / 2 ? Math.round(maxTop) : Math.round(minTop),
      };
    });
  }

  async function handleYes() {
    try {
      const state = loadInvitationState();
      saveInvitationState({ ...state, accepted: true, noAttempts });
    } catch {
      // Ignore storage errors and still continue navigation.
    }

    if (inviteToken) {
      try {
        await fetch(`/api/invitations/${encodeURIComponent(inviteToken)}/accept`, {
          method: "POST",
        });
      } catch {
        // Ignore accept metric errors and still continue navigation.
      }
    }

    if (inviteToken) {
      router.push(`/result?invite=${encodeURIComponent(inviteToken)}`);
      return;
    }
    router.push("/result");
  }

  function triggerNoEscape(pointer?: { x: number; y: number }) {
    setNoAttempts((prev) => prev + 1);

    if (!noFloating) {
      setInitialFloatingFromDom();
      setNoFloating(true);
    }

    randomizeNoButton(pointer);
  }

  function handleNoHover(event: MouseEvent<HTMLButtonElement>) {
    const pointer = { x: event.clientX, y: event.clientY };
    triggerNoEscape(pointer);
  }

  function handleNoPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse") {
      event.preventDefault();
    }
    const pointer = { x: event.clientX, y: event.clientY };
    triggerNoEscape(pointer);
  }

  if (!ready) {
    return <main className="mobile-shell center">불러오는 중...</main>;
  }

  return (
    <main className="mobile-shell center" style={{ position: "relative" }}>
      <section
        ref={panelRef}
        className="paper-panel"
        style={{
          width: "100%",
          padding: 24,
          minHeight: 480,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div style={{ fontSize: 56, lineHeight: 1 }}>💌</div>
        <h1 style={{ marginBottom: 8 }}>초대장이 도착했습니다.</h1>
        <p style={{ marginTop: 0, color: "var(--paper-muted)" }}>수락하시겠습니까?</p>

        <div
          className="row"
          style={{
            justifyContent: "center",
            marginTop: 10,
            width: "100%",
            maxWidth: 280,
            display: "grid",
            gridTemplateColumns: "140px 120px",
            columnGap: 12,
            alignItems: "center",
          }}
        >
          <button ref={yesButtonRef} className="btn-primary" style={{ minWidth: 140 }} onClick={handleYes}>
            네 너무 좋아요
          </button>

          {noFloating ? <div style={{ width: NO_BUTTON_WIDTH, minHeight: NO_BUTTON_HEIGHT }} aria-hidden /> : null}

          <button
            ref={noButtonRef}
            className="btn-danger"
            style={{
              minWidth: NO_BUTTON_WIDTH,
              width: NO_BUTTON_WIDTH,
              minHeight: NO_BUTTON_HEIGHT,
              position: noFloating ? "absolute" : "static",
              left: noFloating ? `${position.left}px` : undefined,
              top: noFloating ? `${position.top}px` : undefined,
              transition: noFloating ? "left 10ms ease-out, top 10ms ease-out" : undefined,
              touchAction: "none",
              opacity: 0.95,
            }}
            onMouseEnter={handleNoHover}
            onPointerDown={handleNoPointerDown}
          >
            아니요
          </button>
        </div>
      </section>
    </main>
  );
}

export default function AcceptPage() {
  return (
    <Suspense fallback={<main className="mobile-shell center">Loading...</main>}>
      <AcceptPageContent />
    </Suspense>
  );
}
