import { AcceptModeKey } from "@/lib/types";

export const DEFAULT_ACCEPT_MODE: AcceptModeKey = "accept1";

export const ACCEPT_MODE_LABELS: Record<AcceptModeKey, string> = {
  accept1: "도망가는 아니요",
  accept2: "점점 작아지는 아니요",
};

export function normalizeAcceptMode(value: string | null | undefined): AcceptModeKey {
  return value === "accept2" ? "accept2" : DEFAULT_ACCEPT_MODE;
}

export function pickRandomAcceptMode(): AcceptModeKey {
  return Math.random() < 0.5 ? "accept1" : "accept2";
}
