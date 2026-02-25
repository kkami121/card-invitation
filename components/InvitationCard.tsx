import { THEMES } from "@/lib/themes";
import { InvitationDraft } from "@/lib/types";

type Props = {
  draft: InvitationDraft;
};

export default function InvitationCard({ draft }: Props) {
  const theme = THEMES[draft.themeKey];

  return (
    <article className="paper-panel" style={{ padding: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 26, letterSpacing: 3 }}>{theme.emojis.join(" ")}</p>
        <h1 className={theme.titleClassName} style={{ color: theme.accent, fontSize: 44, margin: "8px 0 0" }}>
          {draft.title || theme.title}
        </h1>
      </div>

      <section className="stack" style={{ marginTop: 14 }}>
        <div className="row">
          <span aria-hidden>📅</span>
          <p className="meta-text">{draft.date || "날짜를 입력해 주세요."}</p>
        </div>
        <div className="row">
          <span aria-hidden>🕒</span>
          <p className="meta-text">{draft.time || "시간을 입력해 주세요."}</p>
        </div>
        <div className="row">
          <span aria-hidden>📍</span>
          <p className="meta-text">{draft.place || "장소를 입력해 주세요."}</p>
        </div>
      </section>

      <div className="polaroid">
        <img src={draft.imageUrl} alt="초대장 사진" />
      </div>
    </article>
  );
}
