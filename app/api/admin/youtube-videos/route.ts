import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { youtubeVideo } from "@/lib/db/schema/youtube-schema";
import { asc } from "drizzle-orm";

// ─── GET — all videos ──────────────────────────────────
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const rows = await db
    .select()
    .from(youtubeVideo)
    .orderBy(asc(youtubeVideo.sortOrder));

  return NextResponse.json({ videos: rows });
}

// ─── POST — create video ────────────────────────────────
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { title, youtubeUrl, description, sortOrder, active } = body;

  if (!title?.trim() || !youtubeUrl?.trim()) {
    return NextResponse.json(
      { error: "Título y URL de YouTube son requeridos" },
      { status: 400 },
    );
  }

  const [created] = await db
    .insert(youtubeVideo)
    .values({
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      description: description?.trim() || null,
      sortOrder: sortOrder ?? 0,
      active: active ?? true,
    })
    .returning();

  return NextResponse.json({ video: created }, { status: 201 });
}
