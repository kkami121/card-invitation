"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { incrementAcceptedCount, loadInvitationState, saveInvitationState } from "@/lib/storage";

const noMessages = [
  "아니요 버튼이 잠깐 산책 중이에요.",
  "마트료시카처럼 더 작은 아니요가 나타났어요.",
  "경고! 5초 안에 취소하지 않으면 휴대폰이 폭발... 농담입니다.",
  "정말 아니요를 누르고 싶은가요?",
  "5회 시도 이후 보상 조건이 열립니다.",
];

export default function AcceptPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [noAttempts, setNoAttempts] = useState(0);
  const [noUnlocked, setNoUnlocked] = useState(false);
  const [position, setPosition] = useState({ x: 58, y: 0 });

  useEffect(() => {
    const state = loadInvitationState();
    setNoAttempts(state.noAttempts);
    setReady(true);
  }, []);

  const noLabel = useMemo(() => {
    if (noAttempts < noMessages.length) {
      return noMessages[noAttempts];
    }
    return "광고 대신 보상 확인 후 아니요를 누를 수 있어요.";
  }, [noAttempts]);

  function randomizeNoButton() {
    setPosition({
      x: Math.round(Math.random() * 64),
      y: Math.round(Math.random() * 120),
    });
  }

  function handleYes() {
    const state = loadInvitationState();
    saveInvitationState({ ...state, accepted: true, noAttempts });
    incrementAcceptedCount();
    router.push("/result");
  }

  function handleNoHover() {
    if (noUnlocked) {
      return;
    }
    setNoAttempts((prev) => prev + 1);
    randomizeNoButton();
  }

  function unlockNoButton() {
    setNoUnlocked(true);
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
      <section className="paper-panel" style={{ width: "100%", padding: 24, minHeight: 480, position: "relative" }}>
        <div style={{ fontSize: 56, lineHeight: 1 }}>💌</div>
        <h1 style={{ marginBottom: 8 }}>초대장이 도착했습니다.</h1>
        <p style={{ marginTop: 0, color: "var(--paper-muted)" }}>수락하시겠습니까?</p>
        <p style={{ minHeight: 48, fontSize: 14 }}>{noLabel}</p>

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
              top: `${54 + position.y / 10}%`,
              transition: "right 160ms ease, top 160ms ease",
              opacity: noUnlocked ? 1 : 0.95,
            }}
            onMouseEnter={handleNoHover}
            onTouchStart={handleNoHover}
            onClick={noUnlocked ? handleNoClick : undefined}
          >
            아니요
          </button>
        </div>

        {noAttempts >= 5 && !noUnlocked ? (
          <div style={{ marginTop: 190 }}>
            <button className="btn-secondary" onClick={unlockNoButton}>
              보상 확인 완료. 아니요 버튼 잠금 해제
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
