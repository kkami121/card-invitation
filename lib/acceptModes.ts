import { AcceptModeKey } from "@/lib/types";

export const DEFAULT_ACCEPT_MODE: AcceptModeKey = "accept1";

export const ACCEPT_MODE_LABELS: Record<AcceptModeKey, string> = {
  accept1: "도망가는 아니요",
  accept2: "점점 작아지는 아니요",
  accept3: "폭탄 카운트다운",
};

export function normalizeAcceptMode(value: string | null | undefined): AcceptModeKey {
  if (value === "accept2" || value === "accept3") {
    return value;
  }
  return DEFAULT_ACCEPT_MODE;
}

export function pickRandomAcceptMode(): AcceptModeKey {
  const random = Math.random();
  if (random < 1 / 3) {
    return "accept1";
  }
  if (random < 2 / 3) {
    return "accept2";
  }
  return "accept3";
}
