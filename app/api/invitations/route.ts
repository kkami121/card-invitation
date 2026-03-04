import { NextResponse } from "next/server";
import { createInvitation } from "@/lib/server/invitations";
import { InvitationDraft } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { draft?: InvitationDraft };
    if (!body?.draft) {
      return NextResponse.json({ message: "draft is required" }, { status: 400 });
    }

    const created = await createInvitation(body.draft);
    return NextResponse.json({ id: created.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown-error";
    const normalizedMessage = message.toLowerCase();
    if (message === "unsupported-image-type") {
      return NextResponse.json({ message: "unsupported image type" }, { status: 400 });
    }
    if (message === "image-optimize-failed") {
      return NextResponse.json({ message: "image optimize failed" }, { status: 400 });
    }
    if (normalizedMessage.includes("unsupported image format")) {
      return NextResponse.json({ message: "unsupported image type" }, { status: 400 });
    }
    console.error("[api/invitations] create failed:", error);
    return NextResponse.json({ message: "failed to create invitation" }, { status: 500 });
  }
}
