import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { THEMES } from "@/lib/themes";
import { InvitationDraft } from "@/lib/types";

type StoredInvitation = {
  id: string;
  createdAt: number;
  acceptedAt?: number;
  acceptedCount?: number;
  draft: InvitationDraft;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "invitations.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const IMAGE_MAX_SIDE = 1280;
const WEBP_QUALITY = 78;
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

export async function createInvitation(draft: InvitationDraft): Promise<StoredInvitation> {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
  const store = await readStore();

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
    draft: {
      themeKey: draft.themeKey,
      emojis: draft.emojis || theme.emojis.join(" "),
      title: draft.title,
      date: draft.date,
      time: draft.time,
      place: draft.place,
      imageUrl: imageUrl || theme.defaultImageUrl,
    },
  };

  store[id] = saved;
  await writeStore(store);
  return saved;
}

export async function getInvitation(id: string): Promise<StoredInvitation | null> {
  const store = await readStore();
  return store[id] ?? null;
}

export async function markInvitationAccepted(id: string): Promise<StoredInvitation | null> {
  const store = await readStore();
  const item = store[id];
  if (!item) {
    return null;
  }
  // Count every "yes" click, even for the same invitation link.
  item.acceptedCount = (item.acceptedCount ?? 0) + 1;
  item.acceptedAt = Date.now();
  store[id] = item;
  await writeStore(store);
  return item;
}

export async function getInvitationStats(): Promise<{ createdCount: number; acceptedCount: number }> {
  const store = await readStore();
  const items = Object.values(store);
  return {
    createdCount: items.length,
    acceptedCount: items.reduce((sum, item) => {
      if (typeof item.acceptedCount === "number") {
        return sum + item.acceptedCount;
      }
      // Backward compatibility for old records that only had acceptedAt.
      return sum + (item.acceptedAt ? 1 : 0);
    }, 0),
  };
}
