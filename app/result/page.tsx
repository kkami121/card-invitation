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
      <InvitationCard draft={state.draft} />
    </main>
  );
}
