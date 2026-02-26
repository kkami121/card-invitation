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
  } catch {
    return NextResponse.json({ message: "failed to create invitation" }, { status: 500 });
  }
}

