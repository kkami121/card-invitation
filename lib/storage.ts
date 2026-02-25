import { THEMES, defaultImageDataUrl, DEFAULT_THEME_KEY } from "@/lib/themes";
import { InvitationState } from "@/lib/types";

const STORAGE_KEY = "cardInvitationState";

export const initialInvitationState: InvitationState = {
  draft: {
    themeKey: DEFAULT_THEME_KEY,
    title: THEMES[DEFAULT_THEME_KEY].title,
    date: "2026-02-14",
    time: "13:30",
    place: "",
    imageUrl: defaultImageDataUrl,
  },
  accepted: false,
  noAttempts: 0,
};

export function loadInvitationState(): InvitationState {
  if (typeof window === "undefined") {
    return initialInvitationState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initialInvitationState;
  }

  try {
    const parsed = JSON.parse(raw) as InvitationState;
    return {
      ...initialInvitationState,
      ...parsed,
      draft: {
        ...initialInvitationState.draft,
        ...parsed.draft,
      },
    };
  } catch {
    return initialInvitationState;
  }
}

export function saveInvitationState(nextState: InvitationState): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}