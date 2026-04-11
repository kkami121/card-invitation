import { AcceptModeKey } from "@/lib/types";

export const DEFAULT_ACCEPT_MODE: AcceptModeKey = "accept1";

export const ACCEPT_MODE_LABELS: Record<AcceptModeKey, string> = {
  accept1: "도망가는 아니요",
  accept2: "점점 작아지는 아니요",
  accept3: "폭탄 카운트다운",
  accept4: "광고 보고 거절",
};

export function normalizeAcceptMode(value: string | null | undefined): AcceptModeKey {
  if (value === "accept2" || value === "accept3" || value === "accept4") {
    return value;
  }
  return DEFAULT_ACCEPT_MODE;
}

export function pickRandomAcceptMode(): AcceptModeKey {
  return "accept1";
  // const random = Math.random();
  // if (random < 0.25) {
  //   return "accept1";
  // }
  // if (random < 0.5) {
  //   return "accept2";
  // }
  // if (random < 0.75) {
  //   return "accept3";
  // }
  // return "accept4";
}
