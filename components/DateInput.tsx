"use client";

import { type ChangeEvent } from "react";
import { useLocale } from "@/lib/localeContext";

/** 로케일 기준 월 이름 12개 반환 */
function getMonthNames(locale: string): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2000, i, 1))
  );
}

/**
 * Intl.DateTimeFormat으로 로케일의 날짜 부분 순서를 감지합니다.
 * 예) ko → ["year","month","day"]   (2026년 4월 11일)
 *     en → ["month","day","year"]   (April 11, 2026)
 *     de → ["day","month","year"]   (11. April 2026)
 */
function getDatePartOrder(locale: string): Array<"year" | "month" | "day"> {
  try {
    const parts = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).formatToParts(new Date(2000, 0, 15));

    const order = parts
      .map((p) => p.type)
      .filter((t): t is "year" | "month" | "day" =>
        t === "year" || t === "month" || t === "day"
      );

    // 중복 제거하면서 순서 유지
    return [...new Set(order)];
  } catch {
    return ["year", "month", "day"];
  }
}

type Props = {
  value: string;   // "YYYY-MM-DD"
  onChange: (value: string) => void;
};

export default function DateInput({ value, onChange }: Props) {
  const locale = useLocale();
  const monthNames = getMonthNames(locale);
  const partOrder = getDatePartOrder(locale);

  const [yearStr = "", monthStr = "01", dayStr = "01"] = (value || "").split("-");
  const currentYear = new Date().getFullYear();
  const year = parseInt(yearStr, 10) || currentYear;
  const month = parseInt(monthStr, 10) || 1;  // 1–12
  const day = parseInt(dayStr, 10) || 1;

  const daysInMonth = new Date(year, month, 0).getDate();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 1 + i);

  function emit(y: number, m: number, d: number) {
    const maxDay = new Date(y, m, 0).getDate();
    const safeDay = Math.min(d, maxDay);
    onChange(
      `${y}-${String(m).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`
    );
  }

  const selects: Record<"year" | "month" | "day", React.ReactNode> = {
    year: (
      <select
        key="year"
        className="editable-card-select date-select-year"
        value={year}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          emit(parseInt(e.target.value, 10), month, day)
        }
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    ),
    month: (
      <select
        key="month"
        className="editable-card-select date-select-month"
        value={month}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          emit(year, parseInt(e.target.value, 10), day)
        }
      >
        {monthNames.map((name, i) => (
          <option key={i + 1} value={i + 1}>{name}</option>
        ))}
      </select>
    ),
    day: (
      <select
        key="day"
        className="editable-card-select date-select-day"
        value={day}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          emit(year, month, parseInt(e.target.value, 10))
        }
      >
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{String(d).padStart(2, "0")}</option>
        ))}
      </select>
    ),
  };

  return (
    <div className="date-input-custom">
      {partOrder.map((part) => selects[part])}
    </div>
  );
}
