import { THEMES } from "@/lib/themes";
import { InvitationDraft } from "@/lib/types";

type Props = {
  draft: InvitationDraft;
};

const WEEKDAY_LABELS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function formatDisplayDate(raw: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}년 ${month}월 ${day}일 ${WEEKDAY_LABELS[date.getDay()]}`;
}

function formatDisplayTime(raw: string): string | null {
  const match = /^(\d{2}):(\d{2})$/.exec(raw);
  if (!match) {
    return null;
  }

  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour24) || !Number.isInteger(minute) || hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) {
    return null;
  }

  const meridiem = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${meridiem} ${String(hour12).padStart(2, "0")}시 ${String(minute).padStart(2, "0")}분`;
}

export default function InvitationCard({ draft }: Props) {
  const theme = THEMES[draft.themeKey];
  const formattedDate = draft.date ? formatDisplayDate(draft.date) : null;
  const formattedTime = draft.time ? formatDisplayTime(draft.time) : null;

  return (
    <article className="paper-panel" style={{ padding: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 26, letterSpacing: 3 }}>{theme.emojis.join(" ")}</p>
        <h1 className={theme.titleClassName} style={{ color: theme.accent, fontSize: 44, margin: "8px 0 0" }}>
          {draft.title || theme.title}
        </h1>
      </div>

      <section className="stack" style={{ marginTop: 10, gap: 2 }}>
        <div className="row invitation-meta-row">
          <span aria-hidden>📅</span>
          <p className="meta-text">{formattedDate ?? "날짜를 입력해 주세요."}</p>
        </div>
        <div className="row invitation-meta-row">
          <span aria-hidden>🕒</span>
          <p className="meta-text">{formattedTime ?? "시간을 입력해 주세요."}</p>
        </div>
        <div className="row invitation-meta-row">
          <span aria-hidden>📍</span>
          <p className="meta-text">{draft.place || "장소를 입력해 주세요."}</p>
        </div>
      </section>

      <div className="polaroid" style={{ marginTop: 5 }}>
        <img src={draft.imageUrl} alt="초대장 사진" />
      </div>
    </article>
  );
}
