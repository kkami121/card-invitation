import { promises as fs } from "fs";
import path from "path";
import { THEMES } from "@/lib/themes";
import { InvitationDraft } from "@/lib/types";

type StoredInvitation = {
  id: string;
  createdAt: number;
  draft: InvitationDraft;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "invitations.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

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

function parseDataUrlImage(dataUrl: string): { ext: string; bytes: Buffer } | null {
  const matched = /^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!matched) {
    return null;
  }
  const rawExt = matched[1].toLowerCase();
  const ext = rawExt === "jpeg" ? "jpg" : rawExt;
  const bytes = Buffer.from(matched[2], "base64");
  return { ext, bytes };
}

export async function createInvitation(draft: InvitationDraft): Promise<StoredInvitation> {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
  const store = await readStore();

  let imageUrl = draft.imageUrl;
  const image = parseDataUrlImage(draft.imageUrl);
  if (image) {
    const filename = `invite-${id}.${image.ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filepath, image.bytes);
    imageUrl = `/uploads/${filename}`;
  }

  const theme = THEMES[draft.themeKey] ?? THEMES.promise;
  const saved: StoredInvitation = {
    id,
    createdAt: Date.now(),
    draft: {
      themeKey: draft.themeKey,
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

