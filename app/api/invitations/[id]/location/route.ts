import { NextResponse } from "next/server";
import { upsertLocation, getLocations } from "@/lib/locationStore";

export const runtime = "nodejs";

/** POST — 위치 업데이트 전송 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { userId, lat, lng, name } = body as Record<string, unknown>;
  if (
    typeof userId !== "string" ||
    !userId ||
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return NextResponse.json({ error: "invalid fields" }, { status: 400 });
  }

  const safeName = typeof name === "string" ? name.slice(0, 20) : "";
  const entry = upsertLocation(params.id, userId, lat, lng, safeName);
  return NextResponse.json(entry);
}

/** GET — 현재 모든 위치 스냅샷 */
export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const locations = getLocations(params.id);
  const now = Date.now();
  return NextResponse.json(
    locations.map((l) => ({ ...l, isActive: now - l.lastSeen < 30_000 }))
  );
}
