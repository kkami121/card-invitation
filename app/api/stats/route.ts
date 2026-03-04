import { NextResponse } from "next/server";
import { getInvitationStats } from "@/lib/server/invitations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const stats = await getInvitationStats();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ message: "failed to load stats" }, { status: 500 });
  }
}
