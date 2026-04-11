"use client";

import { type ChangeEvent } from "react";

type Props = {
  value: string;   // "HH:MM" 24시간제
  onChange: (value: string) => void;
};

export default function TimeInput({ value, onChange }: Props) {
  const [hourStr = "00", minuteStr = "00"] = (value || "00:00").split(":");
  const hour24 = Math.min(23, Math.max(0, parseInt(hourStr, 10) || 0));
  const minute = Math.min(59, Math.max(0, parseInt(minuteStr, 10) || 0));
  const isPM = hour24 >= 12;
  const hour12 = hour24 % 12 || 12;

  function emit(h24: number, m: number) {
    onChange(`${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }

  return (
    <div className="time-input-custom">
      {/* AM / PM */}
      <select
        className="editable-card-select"
        value={isPM ? "pm" : "am"}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          const toPM = e.target.value === "pm";
          const h = toPM
            ? hour12 === 12 ? 12 : hour12 + 12
            : hour12 === 12 ? 0 : hour12;
          emit(h, minute);
        }}
      >
        <option value="am">AM</option>
        <option value="pm">PM</option>
      </select>

      {/* 시 (1–12) */}
      <select
        className="editable-card-select"
        value={hour12}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          const h12 = parseInt(e.target.value, 10);
          const h24 = isPM
            ? h12 === 12 ? 12 : h12 + 12
            : h12 === 12 ? 0 : h12;
          emit(h24, minute);
        }}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <option key={h} value={h}>{String(h).padStart(2, "0")}</option>
        ))}
      </select>

      <span className="time-input-colon">:</span>

      {/* 분 */}
      <select
        className="editable-card-select"
        value={minute}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => emit(hour24, parseInt(e.target.value, 10))}
      >
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
        ))}
      </select>
    </div>
  );
}
