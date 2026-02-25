"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InvitationCard from "@/components/InvitationCard";
import { initialInvitationState, loadInvitationState } from "@/lib/storage";

export default function ResultPage() {
  const router = useRouter();
  const [state, setState] = useState(initialInvitationState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const next = loadInvitationState();
    setState(next);
    setReady(true);
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
    <main className="mobile-shell stack">
      <section className="paper-panel" style={{ padding: 16 }}>
        <h2 style={{ margin: 0 }}>수락된 초대장</h2>
        <p style={{ marginBottom: 0, color: "var(--paper-muted)" }}>첫 번째 페이지에서 만든 카드가 그대로 표시됩니다.</p>
      </section>

      <InvitationCard draft={state.draft} />
    </main>
  );
}
