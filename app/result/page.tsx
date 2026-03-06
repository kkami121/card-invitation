"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InvitationCard from "@/components/InvitationCard";
import TopBannerAd from "@/components/TopBannerAd";
import { initialInvitationState, loadInvitationState } from "@/lib/storage";
import { THEMES } from "@/lib/themes";
import { InvitationDraft } from "@/lib/types";
import styles from "./result.module.css";

function ResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [state, setState] = useState(initialInvitationState);
  const [ready, setReady] = useState(false);
  const [invitationMissing, setInvitationMissing] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        if (inviteToken) {
          const res = await fetch(`/api/invitations/${encodeURIComponent(inviteToken)}`, { cache: "no-store" });
          if (res.ok) {
            const payload = (await res.json()) as { draft?: InvitationDraft };
            if (payload?.draft) {
              setState({
                draft: payload.draft,
                accepted: true,
                noAttempts: 0,
              });
              return;
            }
          }
          setInvitationMissing(true);
          return;
        }

        const next = loadInvitationState();
        setState(next);
      } catch {
        if (inviteToken) {
          setInvitationMissing(true);
          return;
        }
        setState(initialInvitationState);
      } finally {
        setReady(true);
      }
    }

    init();
  }, [inviteToken]);

  if (!ready) {
    return <main className="mobile-shell center">불러오는 중...</main>;
  }

  if (invitationMissing) {
    return (
      <main className="mobile-shell center stack">
        <section className="paper-panel" style={{ padding: 24, width: "100%" }}>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "30px" }}>만료된 초대장입니다.</h2>
          <p style={{ marginTop: 0 }}>새 초대장을 만들어 다시 공유해 주세요.</p>
          <button className="btn-primary" onClick={() => router.push("/create")}>
            초대장 만들기
          </button>
        </section>
      </main>
    );
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
      <InvitationCard draft={state.draft} photoNoticeText="초대장 정보 및 해당 사진은 약속 날짜 이후 전부 삭제됩니다." />
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

export default function ResultPage() {
  return (
    <Suspense fallback={<main className="mobile-shell center">불러오는 중...</main>}>
      <ResultPageContent />
    </Suspense>
  );
}
