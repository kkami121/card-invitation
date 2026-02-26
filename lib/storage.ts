import { THEMES, defaultImageDataUrl, DEFAULT_THEME_KEY } from "@/lib/themes";
import { InvitationState } from "@/lib/types";

const STORAGE_KEY = "cardInvitationState";
const METRICS_KEY = "cardInvitationMetrics";

type InvitationMetrics = {
  createdCount: number;
  acceptedCount: number;
};

const initialMetrics: InvitationMetrics = {
  createdCount: 0,
  acceptedCount: 0,
};

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

export function loadInvitationMetrics(): InvitationMetrics {
  if (typeof window === "undefined") {
    return initialMetrics;
  }

  const raw = window.localStorage.getItem(METRICS_KEY);
  if (!raw) {
    return initialMetrics;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<InvitationMetrics>;
    return {
      createdCount: Number.isFinite(parsed.createdCount) ? Number(parsed.createdCount) : 0,
      acceptedCount: Number.isFinite(parsed.acceptedCount) ? Number(parsed.acceptedCount) : 0,
    };
  } catch {
    return initialMetrics;
  }
}

function saveInvitationMetrics(next: InvitationMetrics): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(METRICS_KEY, JSON.stringify(next));
}

export function incrementCreatedCount(): void {
  const current = loadInvitationMetrics();
  saveInvitationMetrics({
    ...current,
    createdCount: current.createdCount + 1,
  });
}

export function incrementAcceptedCount(): void {
  const current = loadInvitationMetrics();
  saveInvitationMetrics({
    ...current,
    acceptedCount: current.acceptedCount + 1,
  });
}
