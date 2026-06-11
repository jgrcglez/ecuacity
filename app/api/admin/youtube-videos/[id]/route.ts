import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { youtubeVideo } from "@/lib/db/schema/youtube-schema";
import { eq } from "drizzle-orm";

// ─── PUT — update video ─────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, youtubeUrl, description, sortOrder, active } = body;

  const existing = await db
    .select()
    .from(youtubeVideo)
    .where(eq(youtubeVideo.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
  }

  await db
    .update(youtubeVideo)
    .set({
      title: title?.trim(),
      youtubeUrl: youtubeUrl?.trim(),
      description: description?.trim() ?? null,
      sortOrder,
      active,
    })
    .where(eq(youtubeVideo.id, id));

  return NextResponse.json({ success: true });
}

// ─── DELETE — delete video ───────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await db
    .select()
    .from(youtubeVideo)
    .where(eq(youtubeVideo.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
  }

  await db.delete(youtubeVideo).where(eq(youtubeVideo.id, id));

  return NextResponse.json({ success: true });
}
