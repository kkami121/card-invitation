"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import InvitationCard from "@/components/InvitationCard";
import TopBannerAd from "@/components/TopBannerAd";
import { normalizeAcceptMode } from "@/lib/acceptModes";
import { useT } from "@/lib/localeContext";
import { initialInvitationState, loadInvitationState } from "@/lib/storage";
import { THEMES } from "@/lib/themes";
import { InvitationDraft } from "@/lib/types";
import styles from "./result.module.css";

const FlippableCard = dynamic(() => import("@/components/FlippableCard"), {
  ssr: false,
  loading: () => null,
});

function ResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const t = useT();
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
              const normalizedDraft: InvitationDraft = {
                ...initialInvitationState.draft,
                ...payload.draft,
                acceptMode: normalizeAcceptMode(payload.draft.acceptMode),
              };
              setState({
                draft: normalizedDraft,
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
    return <main className="mobile-shell center">{t.loading}</main>;
  }

  if (invitationMissing) {
    return (
      <main className="mobile-shell center stack">
        <section className="paper-panel" style={{ padding: 24, width: "100%" }}>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "30px" }}>{t.expiredTitle}</h2>
          <p style={{ marginTop: 0 }}>{t.expiredDesc}</p>
          <button className="btn-primary" onClick={() => router.push("/create")}>
            {t.createInvitation}
          </button>
        </section>
      </main>
    );
  }

  if (!state.accepted) {
    return (
      <main className="mobile-shell center stack">
        <section className="paper-panel" style={{ padding: 24, width: "100%" }}>
          <h2 style={{ marginTop: 0 }}>{t.notAcceptedTitle}</h2>
          <p>{t.notAcceptedDesc}</p>
          <button className="btn-primary" onClick={() => router.push("/accept")}>
            {t.goToAccept}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={`mobile-shell stack ${styles.resultShell}`}>
      <TopBannerAd className="ad-top" accentColor={THEMES[state.draft.themeKey].accent} />
      {inviteToken ? (
        <FlippableCard
          draft={state.draft}
          photoNoticeText={t.photoNotice}
          invitationId={inviteToken}
        />
      ) : (
        <InvitationCard draft={state.draft} photoNoticeText={t.photoNotice} />
      )}
      <button
        className="btn-primary"
        style={{ width: "100%", background: THEMES[state.draft.themeKey].accent, marginTop: 5 }}
        onClick={() => router.push("/create")}
      >
        {t.createOwn}
      </button>
    </main>
  );
}

function ResultFallback() {
  const t = useT();
  return <main className="mobile-shell center">{t.loading}</main>;
}

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultFallback />}>
      <ResultPageContent />
    </Suspense>
  );
}
