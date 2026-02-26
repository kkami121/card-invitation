"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InvitationCard from "@/components/InvitationCard";
import TopBannerAd from "@/components/TopBannerAd";
import { THEMES } from "@/lib/themes";
import { initialInvitationState, loadInvitationState } from "@/lib/storage";
import styles from "./result.module.css";

export default function ResultPage() {
  const router = useRouter();
  const [state, setState] = useState(initialInvitationState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const next = loadInvitationState();
      setState(next);
    } catch {
      setState(initialInvitationState);
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return <main className="mobile-shell center">불러오는 중...</main>;
  }

  if (!state.accepted) {
    return (
      <main className="mobile-shell center stack">
        <section className="paper-panel" style={{ padding: 24, width: "100%" }}>
          <h2 style={{ marginTop: 0 }}>아직 수락되지 않았어요</h2>
          <p>수락 페이지로 다시 이동해 주세요.</p>
          <button className="btn-primary" onClick={() => router.push("/accept")}>
            수락 페이지로 이동
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={`mobile-shell stack ${styles.resultShell}`}>
      <TopBannerAd className="ad-top" accentColor={THEMES[state.draft.themeKey].accent} />
      <InvitationCard draft={state.draft} />
      <button
        className="btn-primary"
        style={{ width: "100%", background: THEMES[state.draft.themeKey].accent }}
        onClick={() => router.push("/create")}
      >
        나도 초대장 만들기
      </button>
    </main>
  );
}
