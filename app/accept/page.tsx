"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseInviteToken } from "@/lib/invite";
import { incrementAcceptedCount, loadInvitationState, saveInvitationState } from "@/lib/storage";

export default function AcceptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [ready, setReady] = useState(false);
  const [noAttempts, setNoAttempts] = useState(0);
  const [position, setPosition] = useState({ x: 58, y: 40 });

  useEffect(() => {
    if (inviteToken) {
      const parsed = parseInviteToken(inviteToken);
      if (parsed) {
        saveInvitationState({
          draft: parsed.draft,
          accepted: false,
          noAttempts: 0,
        });
        setNoAttempts(0);
        setReady(true);
        return;
      }
    }

    const state = loadInvitationState();
    setNoAttempts(state.noAttempts);
    setReady(true);
  }, [inviteToken]);

  function randomizeNoButton() {
    setPosition({
      x: Math.round(Math.random() * 64),
      y: Math.round(Math.random() * 65) + 15,
    });
  }

  function handleYes() {
    const state = loadInvitationState();
    saveInvitationState({ ...state, accepted: true, noAttempts });
    incrementAcceptedCount();
    if (inviteToken) {
      router.push(`/result?invite=${encodeURIComponent(inviteToken)}`);
      return;
    }
    router.push("/result");
  }

  function handleNoHover() {
    setNoAttempts((prev) => prev + 1);
    randomizeNoButton();
  }

  function handleNoClick() {
    const state = loadInvitationState();
    saveInvitationState({ ...state, accepted: false, noAttempts });
    router.push("/create");
  }

  if (!ready) {
    return <main className="mobile-shell center">불러오는 중...</main>;
  }

  return (
    <main className="mobile-shell center" style={{ position: "relative" }}>
      <section
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
        }}
      >
        <div style={{ fontSize: 56, lineHeight: 1 }}>💌</div>
        <h1 style={{ marginBottom: 8 }}>초대장이 도착했습니다.</h1>
        <p style={{ marginTop: 0, color: "var(--paper-muted)" }}>수락하시겠습니까?</p>

        <div className="row" style={{ justifyContent: "center", marginTop: 10 }}>
          <button className="btn-primary" style={{ minWidth: 140 }} onClick={handleYes}>
            네 너무 좋아요
          </button>

          <button
            className="btn-danger"
            style={{
              minWidth: 120,
              position: "absolute",
              right: `${position.x}%`,
              top: `${position.y}%`,
              transition: "right 160ms ease, top 160ms ease",
              opacity: 0.95,
            }}
            onMouseEnter={handleNoHover}
            onTouchStart={handleNoHover}
            onClick={handleNoClick}
          >
            아니요
          </button>
        </div>
      </section>
    </main>
  );
}
