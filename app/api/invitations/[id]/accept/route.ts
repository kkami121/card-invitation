import { NextResponse } from "next/server";
import { markInvitationAccepted } from "@/lib/server/invitations";

export const runtime = "nodejs";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const item = await markInvitationAccepted(params.id);
    if (!item) {
      return NextResponse.json({ message: "not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "failed to mark accepted" }, { status: 500 });
  }
}
