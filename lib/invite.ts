import { normalizeAcceptMode } from "@/lib/acceptModes";
import { DEFAULT_THEME_KEY, THEMES } from "@/lib/themes";
import { InvitationDraft, OccasionKey } from "@/lib/types";

type SharedDraft = Omit<InvitationDraft, "imageUrl">;

type InvitePayload = {
  v: 1;
  id: string;
  createdAt: number;
  draft: SharedDraft;
};

type ParsedInvitePayload = {
  v: 1;
  id: string;
  createdAt: number;
  draft: InvitationDraft;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Uint8Array | null {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    const binary = atob(base64 + padding);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

function createInviteId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export function buildInviteToken(draft: InvitationDraft): string {
  const { imageUrl: _ignoredImageUrl, ...sharedDraft } = draft;
  const payload: InvitePayload = {
    v: 1,
    id: createInviteId(),
    createdAt: Date.now(),
    draft: sharedDraft,
  };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return toBase64Url(bytes);
}

export function parseInviteToken(token: string): ParsedInvitePayload | null {
  const bytes = fromBase64Url(token);
  if (!bytes) {
    return null;
  }

  try {
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as Partial<InvitePayload>;
    if (parsed.v !== 1 || typeof parsed.id !== "string" || typeof parsed.createdAt !== "number" || !parsed.draft) {
      return null;
    }

    const draft = parsed.draft as Partial<SharedDraft>;
    const themeKeyCandidate = typeof draft.themeKey === "string" ? (draft.themeKey as OccasionKey) : null;
    const themeKey = themeKeyCandidate && themeKeyCandidate in THEMES ? themeKeyCandidate : DEFAULT_THEME_KEY;
    if (
      typeof draft.acceptMode !== "undefined" &&
      typeof draft.acceptMode !== "string"
    ) {
      return null;
    }

    if (
      typeof draft.emojis !== "string" ||
      typeof draft.title !== "string" ||
      typeof draft.date !== "string" ||
      typeof draft.time !== "string" ||
      typeof draft.place !== "string"
    ) {
      return null;
    }

    return {
      v: 1,
      id: parsed.id,
      createdAt: parsed.createdAt,
      draft: {
        themeKey,
        acceptMode: normalizeAcceptMode(draft.acceptMode),
        emojis: draft.emojis,
        title: draft.title,
        date: draft.date,
        time: draft.time,
        place: draft.place,
        imageUrl: THEMES[themeKey].defaultImageUrl,
      },
    };
  } catch {
    return null;
  }
}
