"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { initialInvitationState, saveInvitationState } from "@/lib/storage";
import { THEMES, defaultImageDataUrl } from "@/lib/themes";
import { InvitationDraft, OccasionKey } from "@/lib/types";

export default function CreatePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<InvitationDraft>(initialInvitationState.draft);
  const themes = useMemo(() => Object.values(THEMES), []);
  const theme = THEMES[draft.themeKey];

  function updateField<K extends keyof InvitationDraft>(key: K, value: InvitationDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
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
    saveInvitationState({
      draft,
      accepted: false,
      noAttempts: 0,
    });
    router.push("/accept");
  }

  return (
    <main className="mobile-shell stack">
      <section className="paper-panel" style={{ padding: 20 }}>
        <label>
          Occasion
          <select value={draft.themeKey} onChange={(e) => updateField("themeKey", e.target.value as OccasionKey)}>
            {themes.map((themeOption) => (
              <option key={themeOption.key} value={themeOption.key}>
                {themeOption.label}
              </option>
            ))}
          </select>
        </label>

        <article style={{ marginTop: 16 }}>
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
              <span aria-hidden>DATE</span>
              <input
                className="editable-card-input"
                type="date"
                value={draft.date}
                onChange={(e) => updateField("date", e.target.value)}
              />
            </div>
            <div className="row">
              <span aria-hidden>TIME</span>
              <input
                className="editable-card-input"
                type="time"
                value={draft.time}
                onChange={(e) => updateField("time", e.target.value)}
              />
            </div>
            <div className="row">
              <span aria-hidden>PLACE</span>
              <input
                className="editable-card-input"
                value={draft.place}
                onChange={(e) => updateField("place", e.target.value)}
                placeholder="Enter place"
              />
            </div>
          </section>

          <div className="polaroid">
            <img src={draft.imageUrl} alt="invitation photo" />
            <label className="upload-inline">
              Change Photo
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </article>

        <button className="btn-primary" style={{ width: "100%", marginTop: 12 }} onClick={goAccept}>
          Save and Open
        </button>
      </section>
    </main>
  );
}