import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function isSafeFilename(filename: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(filename);
}

function contentTypeFromName(filename: string): string {
  const lowered = filename.toLowerCase();
  if (lowered.endsWith(".webp")) {
    return "image/webp";
  }
  if (lowered.endsWith(".png")) {
    return "image/png";
  }
  if (lowered.endsWith(".jpg") || lowered.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  return "application/octet-stream";
}

export async function GET(_: Request, { params }: { params: { filename: string } }) {
  const filename = params.filename;
  if (!filename || !isSafeFilename(filename)) {
    return NextResponse.json({ message: "invalid filename" }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  if (path.dirname(filePath) !== UPLOAD_DIR) {
    return NextResponse.json({ message: "invalid path" }, { status: 400 });
  }

  try {
    const bytes = await fs.readFile(filePath);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentTypeFromName(filename),
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }
}
