"use client";

import { Suspense, type MouseEvent, type PointerEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_ACCEPT_MODE, normalizeAcceptMode } from "@/lib/acceptModes";
import { useT } from "@/lib/localeContext";
import { hasAcceptedInvitation, initialInvitationState, loadInvitationState, markInvitationAccepted, saveInvitationState } from "@/lib/storage";
import { THEMES } from "@/lib/themes";
import type { AcceptModeKey, InvitationDraft } from "@/lib/types";

const BASE_ICON = "💌";

const YES_BUTTON_WIDTH = 140;
const NO_BUTTON_WIDTH = 120;
const AD_REJECT_BUTTON_WIDTH = 160;
const NO_BUTTON_HEIGHT = 44;
const ACTION_BUTTON_GAP = 12;
const ACTION_ROW_MAX_WIDTH = YES_BUTTON_WIDTH + NO_BUTTON_WIDTH + ACTION_BUTTON_GAP;
const AD_ACTION_ROW_MAX_WIDTH = YES_BUTTON_WIDTH + AD_REJECT_BUTTON_WIDTH + ACTION_BUTTON_GAP;
const AD_REWARD_COUNTDOWN_SECONDS = 5;
const EDGE_PADDING = 12;
const MIN_MOVE_PX = 120;
const MAX_MOVE_PX = 200;
const POINTER_SAFE_RADIUS = 96;
const YES_SAFE_MARGIN = 18;
const BOMB_COUNTDOWN_MS = 5000;

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
  const t = useT();

  const BASE_HEADING = t.acceptHeading;
  const BASE_SUBHEADING = t.acceptSubheading;
  const BASE_YES_LABEL = t.yesLabel;
  const ACCEPT_INVITE_LABEL = t.acceptInviteLabel;

  const [ready, setReady] = useState(false);
  const [invitationMissing, setInvitationMissing] = useState(false);
  const [acceptMode, setAcceptMode] = useState<AcceptModeKey>(DEFAULT_ACCEPT_MODE);
  const [noAttempts, setNoAttempts] = useState(0);
  const [noFloating, setNoFloating] = useState(false);
  const [shrinkLevel, setShrinkLevel] = useState(0);
  const [bombStarted, setBombStarted] = useState(false);
  const [bombRemainingMs, setBombRemainingMs] = useState(BOMB_COUNTDOWN_MS);
  const [adRejectPrompt, setAdRejectPrompt] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(AD_REWARD_COUNTDOWN_SECONDS);
  const [adRejectCompleted, setAdRejectCompleted] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const panelRef = useRef<HTMLElement | null>(null);
  const yesButtonRef = useRef<HTMLButtonElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    async function init() {
      try {
        if (inviteToken) {
          // 이미 수락한 초대장이면 결과 페이지로 바로 이동
          if (hasAcceptedInvitation(inviteToken)) {
            router.replace(`/result?invite=${encodeURIComponent(inviteToken)}`);
            return;
          }

          const res = await fetch(`/api/invitations/${encodeURIComponent(inviteToken)}`, { cache: "no-store" });
          if (res.ok) {
            const payload = (await res.json()) as { draft?: InvitationDraft };
            if (payload?.draft) {
              const theme = THEMES[payload.draft.themeKey] ?? THEMES.promise;
              const normalizedDraft: InvitationDraft = {
                ...initialInvitationState.draft,
                ...payload.draft,
                acceptMode: normalizeAcceptMode(payload.draft.acceptMode),
                emojis: payload.draft.emojis || theme.emojis.join(" "),
              };

              saveInvitationState({
                draft: normalizedDraft,
                accepted: false,
                noAttempts: 0,
              });
              setAcceptMode(normalizedDraft.acceptMode);
              setNoAttempts(0);
              setNoFloating(false);
              setShrinkLevel(0);
              setBombStarted(false);
              setBombRemainingMs(BOMB_COUNTDOWN_MS);
              setAdRejectPrompt(false);
              setAdModalOpen(false);
              setAdCountdown(AD_REWARD_COUNTDOWN_SECONDS);
              setAdRejectCompleted(false);
              return;
            }
          }

          setInvitationMissing(true);
          setAcceptMode(DEFAULT_ACCEPT_MODE);
          setNoAttempts(0);
          setAdModalOpen(false);
          setAdCountdown(AD_REWARD_COUNTDOWN_SECONDS);
          setAdRejectCompleted(false);
          return;
        }

        const state = loadInvitationState();
        setAcceptMode(normalizeAcceptMode(state.draft.acceptMode));
        setNoAttempts(state.noAttempts);
        setNoFloating(false);
        setShrinkLevel(0);
        setBombStarted(false);
        setBombRemainingMs(BOMB_COUNTDOWN_MS);
        setAdRejectPrompt(false);
        setAdModalOpen(false);
        setAdCountdown(AD_REWARD_COUNTDOWN_SECONDS);
        setAdRejectCompleted(false);
      } catch {
        if (inviteToken) {
          setInvitationMissing(true);
          setAcceptMode(DEFAULT_ACCEPT_MODE);
          setNoAttempts(0);
          setAdModalOpen(false);
          setAdCountdown(AD_REWARD_COUNTDOWN_SECONDS);
          setAdRejectCompleted(false);
          return;
        }

        setAcceptMode(DEFAULT_ACCEPT_MODE);
        setNoAttempts(0);
        setAdModalOpen(false);
        setAdCountdown(AD_REWARD_COUNTDOWN_SECONDS);
        setAdRejectCompleted(false);
      } finally {
        setReady(true);
      }
    }

    init();
  }, [inviteToken]);

  /* accept3: 폭탄 카운트다운
  useEffect(() => {
    if (acceptMode !== "accept3" || !bombStarted || bombRemainingMs <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setBombRemainingMs((prev) => Math.max(prev - 100, 0));
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [acceptMode, bombStarted, bombRemainingMs]);
  */

  /* accept4: 광고 카운트다운
  useEffect(() => {
    if (!adModalOpen || adCountdown <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setAdCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [adModalOpen, adCountdown]);
  */

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

      let yesSafeZone: { left: number; top: number; right: number; bottom: number } | null = null;
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
      markInvitationAccepted(inviteToken);
      router.push(`/result?invite=${encodeURIComponent(inviteToken)}`);
      return;
    }

    router.push("/result");
  }

  function handleAdRewardStart() {
    if (adRejectCompleted) {
      return;
    }
    setAdCountdown(AD_REWARD_COUNTDOWN_SECONDS);
    setAdModalOpen(true);
  }

  function handleAdModalClose() {
    if (adCountdown > 0) {
      return;
    }
    setAdModalOpen(false);
    setAdRejectCompleted(true);
  }

  function triggerNoReaction(pointer?: { x: number; y: number }) {
    setNoAttempts((prev) => prev + 1);

    // if (acceptMode === "accept2") {
    //   setShrinkLevel((prev) => Math.min(prev + 1, 4));
    //   return;
    // }

    // if (acceptMode === "accept3") {
    //   setBombStarted(true);
    //   setBombRemainingMs(BOMB_COUNTDOWN_MS);
    //   return;
    // }

    // if (acceptMode === "accept4") {
    //   setAdRejectPrompt(true);
    //   return;
    // }

    if (!noFloating) {
      setInitialFloatingFromDom();
      setNoFloating(true);
    }

    randomizeNoButton(pointer);
  }

  function handleNoHover(event: MouseEvent<HTMLButtonElement>) {
    if (acceptMode !== "accept1") {
      return;
    }
    triggerNoReaction({ x: event.clientX, y: event.clientY });
  }

  function handleNoPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (acceptMode !== "accept1") {
      return;
    }
    if (event.pointerType !== "mouse") {
      event.preventDefault();
    }
    triggerNoReaction({ x: event.clientX, y: event.clientY });
  }

  function handleShrinkingNoClick() {
    if (acceptMode !== "accept2") {
      return;
    }
    triggerNoReaction();
  }

  function handleBombNoClick() {
    if (acceptMode !== "accept3") {
      return;
    }
    triggerNoReaction();
  }

  function handleAdPromptNoClick() {
    if (acceptMode !== "accept4") {
      return;
    }
    triggerNoReaction();
  }

  if (!ready) {
    return <main className="mobile-shell center">{t.loading}</main>;
  }

  if (invitationMissing) {
    return (
      <main className="mobile-shell center stack">
        <section className="paper-panel" style={{ padding: 24, width: "100%", textAlign: "center" }}>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "30px" }}>{t.expiredTitle}</h2>
          <p style={{ marginTop: 0 }}>{t.expiredDesc}</p>
          <button className="btn-primary" onClick={() => router.push("/create")}>
            {t.createInvitation}
          </button>
        </section>
      </main>
    );
  }

  const shrinkingNoButton = acceptMode === "accept2";
  const bombMode = acceptMode === "accept3";
  const adMode = acceptMode === "accept4";
  const noHidden = shrinkingNoButton && shrinkLevel >= 4;
  const bombTriggered = bombMode && bombStarted;
  const bombExploded = bombTriggered && bombRemainingMs <= 0;
  const noScale = shrinkingNoButton ? Math.max(0.18, 1 - shrinkLevel * 0.2) : 1;
  const countdownSeconds = (bombRemainingMs / 1000).toFixed(1);
  const fuseRatio = bombTriggered ? Math.max(bombRemainingMs / BOMB_COUNTDOWN_MS, 0) : 1;

  const headingText = bombExploded ? "" : bombTriggered ? "곧 폭탄이 폭발합니다." : BASE_HEADING;
  const subheadingText = bombExploded
    ? ""
    : bombTriggered
      ? "초대를 수락해 주세요"
      : BASE_SUBHEADING;
  const icon = bombTriggered ? (bombExploded ? "💥" : "💣") : adMode && adRejectPrompt ? "📺" : BASE_ICON;
  const showSplitAdButtons = adMode && adRejectPrompt;
  const displayHeadingText = adRejectCompleted
    ? "거절 완료"
    : adMode && adRejectPrompt
      ? "광고 시청 후 거절하기"
      : headingText;
  const displaySubheadingText = adRejectCompleted
    ? "광고 시청후 거절 처리되었어요."
    : adMode && adRejectPrompt
      ? "거절 하시겠습니까?"
      : subheadingText;
  const adCloseButtonLabel = adCountdown > 0 ? `닫기 (${adCountdown})` : "닫기";
  const headingStyle = adMode && adRejectPrompt
    ? { marginBottom: 8, fontSize: "clamp(22px, 5vw, 28px)", whiteSpace: "nowrap" as const }
    : { marginBottom: 8 };

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
        <div style={{ fontSize: 56, lineHeight: 1 }}>{icon}</div>
        {displayHeadingText ? <h1 style={headingStyle}>{displayHeadingText}</h1> : null}
        {displaySubheadingText ? <p style={{ marginBottom: 8, marginTop: 0, color: "var(--paper-muted)" }}>{displaySubheadingText}</p> : null}

        {bombTriggered ? (
          <div style={{ width: "100%", maxWidth: 300, marginTop: 2, marginBottom: 8 }}>
            {bombExploded ? (
              <p style={{ marginTop: 20, marginBottom: 10, fontSize: 56, fontWeight: 900, color: "#b21f1f", lineHeight: 1 }}>펑!</p>
            ) : (
              <>
                <p style={{ marginTop: 0, marginBottom: 6, fontSize: 13, fontWeight: 750, color: "#6e1d1d" }}>
                  제한 시간 안에 초대를 수락해야 합니다.
                </p>
                <p style={{ marginTop: 0, marginBottom: 10, fontSize: 22, fontWeight: 800, color: "#b21f1f" }}>
                  {countdownSeconds}초
                </p>
                <div
                  aria-hidden
                  style={{
                    width: "100%",
                    height: 10,
                    borderRadius: 999,
                    background: "rgba(0, 0, 0, 0.08)",
                    overflow: "hidden",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(fuseRatio * 100, 0)}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "linear-gradient(90deg, #f8bf44 0%, #ff7a18 55%, #d62828 100%)",
                      transition: "width 100ms linear",
                    }}
                  />
                </div>
              </>
            )}
          </div>
        ) : null}

        {adRejectCompleted ? null : showSplitAdButtons ? (
          <div
            style={{
              width: "100%",
              maxWidth: AD_ACTION_ROW_MAX_WIDTH,
              marginTop: 10,
              display: "grid",
              gridTemplateColumns: `${YES_BUTTON_WIDTH}px ${AD_REJECT_BUTTON_WIDTH}px`,
              columnGap: ACTION_BUTTON_GAP,
              alignItems: "center",
            }}
          >
            <button
              className="btn-primary"
              style={{ minWidth: YES_BUTTON_WIDTH, minHeight: NO_BUTTON_HEIGHT }}
              onClick={handleYes}
            >
              초대 수락하기
            </button>
            <button
              className="btn-secondary accept4-ad-button"
              data-label="광고보고 거절하기"
              style={{
                minWidth: AD_REJECT_BUTTON_WIDTH,
                width: AD_REJECT_BUTTON_WIDTH,
                minHeight: NO_BUTTON_HEIGHT,
                whiteSpace: "nowrap",
              }}
              onClick={handleAdRewardStart}
            >
              광고보고 거절하기
            </button>
          </div>
        ) : bombTriggered && !bombExploded ? (
          <div
            className="row"
            style={{
              justifyContent: "center",
              marginTop: 10,
              width: "100%",
              maxWidth: YES_BUTTON_WIDTH,
            }}
          >
            <button
              ref={yesButtonRef}
              className="btn-primary"
              style={{ minWidth: YES_BUTTON_WIDTH, minHeight: NO_BUTTON_HEIGHT }}
              onClick={handleYes}
            >
              {ACCEPT_INVITE_LABEL}
            </button>
          </div>
        ) : (
          <div
            className="row"
            style={{
              justifyContent: "center",
              marginTop: 10,
              width: "100%",
              maxWidth: ACTION_ROW_MAX_WIDTH,
              display: "grid",
              gridTemplateColumns: `${YES_BUTTON_WIDTH}px ${NO_BUTTON_WIDTH}px`,
              columnGap: ACTION_BUTTON_GAP,
              alignItems: "center",
            }}
          >
            {bombExploded ? <div style={{ width: YES_BUTTON_WIDTH, minHeight: NO_BUTTON_HEIGHT }} aria-hidden /> : (
              <button
                ref={yesButtonRef}
                className="btn-primary"
                style={{ minWidth: YES_BUTTON_WIDTH, minHeight: NO_BUTTON_HEIGHT }}
                onClick={handleYes}
              >
                {BASE_YES_LABEL}
              </button>
            )}

            {noFloating || noHidden || bombTriggered ? <div style={{ width: NO_BUTTON_WIDTH, minHeight: NO_BUTTON_HEIGHT }} aria-hidden /> : null}

            {noHidden || bombTriggered ? null : (
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
                  transition: noFloating ? "left 10ms ease-out, top 10ms ease-out" : "transform 140ms ease, opacity 140ms ease",
                  touchAction: "none",
                  opacity: shrinkingNoButton ? Math.max(0.2, 1 - shrinkLevel * 0.18) : 0.95,
                  transform: shrinkingNoButton ? `scale(${noScale})` : undefined,
                  transformOrigin: "center",
                }}
                onMouseEnter={shrinkingNoButton || bombMode || adMode ? undefined : handleNoHover}
                onPointerDown={shrinkingNoButton || bombMode || adMode ? undefined : handleNoPointerDown}
                onClick={
                  shrinkingNoButton
                    ? handleShrinkingNoClick
                    : bombMode
                      ? handleBombNoClick
                      : adMode
                        ? handleAdPromptNoClick
                        : undefined
                }
              >
                {t.noLabel}
              </button>
            )}
          </div>
        )}
      </section>

      {adModalOpen ? (
        <div className="ad-modal-backdrop" role="presentation">
          <section
            className="ad-modal"
            role="dialog"
            aria-modal="true"
            aria-label="reward-ad-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="ad-modal-title">광고 시청 후 거절하기</h3>
            
             
                <img
                  src="/accept4_ad.jpg"
                  alt="accept4 advertisement"
                  className="ad-modal-image"
                />
         
              
          
            <div
              aria-hidden
              style={{
                width: "100%",
                height: 8,
                marginTop: 14,
                borderRadius: 999,
                background: "rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${((AD_REWARD_COUNTDOWN_SECONDS - adCountdown) / AD_REWARD_COUNTDOWN_SECONDS) * 100}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #2e6342 0%, #88b17d 100%)",
                  transition: "width 1s linear",
                }}
              />
            </div>
            <p className="ad-modal-line" style={{ marginTop: 10, textAlign: "center", color: "#6f6557" }}>
              {adCountdown > 0 ? `${adCountdown}초 후 닫을 수 있어요.` : ""}
            </p>
            <button
              type="button"
              className="btn-primary ad-modal-close"
              style={{ opacity: adCountdown > 0 ? 0.6 : 1, cursor: adCountdown > 0 ? "not-allowed" : "pointer" }}
              disabled={adCountdown > 0}
              onClick={handleAdModalClose}
            >
              {adCloseButtonLabel}
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function AcceptFallback() {
  const t = useT();
  return <main className="mobile-shell center">{t.loading}</main>;
}

export default function AcceptPage() {
  return (
    <Suspense fallback={<AcceptFallback />}>
      <AcceptPageContent />
    </Suspense>
  );
}
