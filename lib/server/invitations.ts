import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { normalizeAcceptMode } from "@/lib/acceptModes";
import { THEMES } from "@/lib/themes";
import { InvitationDraft } from "@/lib/types";

type StoredInvitation = {
  id: string;
  createdAt: number;
  acceptedAt?: number;
  acceptedCount?: number;
  creatorUserId?: string;
  draft: InvitationDraft;
};

type PersistedStats = {
  createdCount: number;
  acceptedCount: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "invitations.json");
const STATS_FILE = path.join(DATA_DIR, "stats.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const IMAGE_MAX_SIDE = 1280;
const WEBP_QUALITY = 78;
const INVITATION_RETENTION_DAYS = 30;
const INVITATION_RETENTION_MS = INVITATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;
const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function readStore(): Promise<Record<string, StoredInvitation>> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Record<string, StoredInvitation>;
  } catch {
    return {};
  }
}

async function writeStore(store: Record<string, StoredInvitation>) {
  await ensureDirs();
  await fs.writeFile(DATA_FILE, JSON.stringify(store), "utf8");
}

function countAcceptedFromStore(store: Record<string, StoredInvitation>): number {
  return Object.values(store).reduce((sum, item) => {
    if (typeof item.acceptedCount === "number") {
      return sum + item.acceptedCount;
    }
    // Backward compatibility for old records that only had acceptedAt.
    return sum + (item.acceptedAt ? 1 : 0);
  }, 0);
}

async function readStats(storeForInit: Record<string, StoredInvitation>): Promise<PersistedStats> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(STATS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<PersistedStats>;
    if (typeof parsed.createdCount === "number" && typeof parsed.acceptedCount === "number") {
      return {
        createdCount: parsed.createdCount,
        acceptedCount: parsed.acceptedCount,
      };
    }
  } catch {
    // fall through and initialize from current store
  }

  const initialized: PersistedStats = {
    createdCount: Object.keys(storeForInit).length,
    acceptedCount: countAcceptedFromStore(storeForInit),
  };
  await writeStats(initialized);
  return initialized;
}

async function writeStats(stats: PersistedStats) {
  await ensureDirs();
  await fs.writeFile(STATS_FILE, JSON.stringify(stats), "utf8");
}

function getTodayDateStringInKst(): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function extractUploadFilename(imageUrl: string): string | null {
  const apiPrefix = "/api/uploads/";
  const oldPrefix = "/uploads/";
  if (imageUrl.startsWith(apiPrefix)) {
    return imageUrl.slice(apiPrefix.length);
  }
  if (imageUrl.startsWith(oldPrefix)) {
    return imageUrl.slice(oldPrefix.length);
  }
  return null;
}

async function removeInvitationImageIfExists(item: StoredInvitation) {
  const filename = extractUploadFilename(item.draft.imageUrl);
  if (!filename) {
    return;
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return;
  }
  const filepath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(filepath);
  } catch {
    // Ignore missing file or delete errors to keep cleanup resilient.
  }
}

async function purgeExpiredInvitations(store: Record<string, StoredInvitation>): Promise<Record<string, StoredInvitation>> {
  const today = getTodayDateStringInKst();
  const now = Date.now();
  const nextStore: Record<string, StoredInvitation> = {};
  const expiredItems: StoredInvitation[] = [];

  for (const item of Object.values(store)) {
    const inviteDate = item.draft.date;
    const isPastPromiseDate = isValidDateString(inviteDate) && inviteDate < today;
    const isOlderThanRetention = now - item.createdAt >= INVITATION_RETENTION_MS;

    if (isPastPromiseDate || isOlderThanRetention) {
      expiredItems.push(item);
      continue;
    }
    nextStore[item.id] = item;
  }

  if (expiredItems.length === 0) {
    return store;
  }

  await Promise.all(expiredItems.map((item) => removeInvitationImageIfExists(item)));
  await writeStore(nextStore);
  return nextStore;
}

async function prepareStoreAndStats(): Promise<{ store: Record<string, StoredInvitation>; stats: PersistedStats }> {
  const rawStore = await readStore();
  const stats = await readStats(rawStore);
  const store = await purgeExpiredInvitations(rawStore);
  return { store, stats };
}

function parseDataUrlImage(dataUrl: string): { mime: string; bytes: Buffer } | null {
  const matched = /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!matched) {
    return null;
  }
  const mime = matched[1].toLowerCase();
  const bytes = Buffer.from(matched[2], "base64");
  return { mime, bytes };
}

async function optimizeImage(bytes: Buffer): Promise<Buffer> {
  try {
    return sharp(bytes)
      .rotate()
      .resize({
        width: IMAGE_MAX_SIDE,
        height: IMAGE_MAX_SIDE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    throw new Error("image-optimize-failed");
  }
}

async function writeFileAtomic(filepath: string, content: Buffer): Promise<void> {
  const dir = path.dirname(filepath);
  const name = path.basename(filepath);
  const tempPath = path.join(dir, `.${name}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
  await fs.writeFile(tempPath, content);
  await fs.rename(tempPath, filepath);
}

export async function createInvitation(draft: InvitationDraft, creatorUserId?: string): Promise<StoredInvitation> {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
  const prepared = await prepareStoreAndStats();
  const store = prepared.store;
  const stats = prepared.stats;

  let imageUrl = draft.imageUrl;
  const image = parseDataUrlImage(draft.imageUrl);
  if (image) {
    if (!ACCEPTED_MIME_TYPES.has(image.mime)) {
      throw new Error("unsupported-image-type");
    }
    const optimizedBytes = await optimizeImage(image.bytes);
    const filename = `invite-${id}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);
    await writeFileAtomic(filepath, optimizedBytes);
    imageUrl = `/api/uploads/${filename}`;
  }

  const theme = THEMES[draft.themeKey] ?? THEMES.promise;
  const saved: StoredInvitation = {
    id,
    createdAt: Date.now(),
    ...(creatorUserId ? { creatorUserId } : {}),
    draft: {
      themeKey: draft.themeKey,
      acceptMode: normalizeAcceptMode(draft.acceptMode),
      emojis: draft.emojis || theme.emojis.join(" "),
      title: draft.title,
      date: draft.date,
      time: draft.time,
      place: draft.place,
      imageUrl: imageUrl || theme.defaultImageUrl,
    },
  };

  store[id] = saved;
  await Promise.all([
    writeStore(store),
    writeStats({
      ...stats,
      createdCount: stats.createdCount + 1,
    }),
  ]);
  return saved;
}

export async function getInvitation(id: string): Promise<StoredInvitation | null> {
  const { store } = await prepareStoreAndStats();
  return store[id] ?? null;
}

export async function markInvitationAccepted(id: string): Promise<StoredInvitation | null> {
  const prepared = await prepareStoreAndStats();
  const store = prepared.store;
  const stats = prepared.stats;
  const item = store[id];
  if (!item) {
    return null;
  }
  // Count every "yes" click, even for the same invitation link.
  item.acceptedCount = (item.acceptedCount ?? 0) + 1;
  item.acceptedAt = Date.now();
  store[id] = item;
  await Promise.all([
    writeStore(store),
    writeStats({
      ...stats,
      acceptedCount: stats.acceptedCount + 1,
    }),
  ]);
  return item;
}

export async function getInvitationStats(): Promise<{ createdCount: number; acceptedCount: number }> {
  const { stats } = await prepareStoreAndStats();
  return {
    createdCount: stats.createdCount,
    acceptedCount: stats.acceptedCount,
  };
}
