import { NextResponse } from "next/server";
import { getInvitation } from "@/lib/server/invitations";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const item = await getInvitation(params.id);
    if (!item) {
      return NextResponse.json({ message: "not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ message: "failed to load invitation" }, { status: 500 });
  }
}

