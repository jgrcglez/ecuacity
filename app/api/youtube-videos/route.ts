import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { youtubeVideo } from "@/lib/db/schema/youtube-schema";
import { eq, asc } from "drizzle-orm";

// ─── GET — active videos (public, no auth) ───────────────
export async function GET() {
  const rows = await db
    .select()
    .from(youtubeVideo)
    .where(eq(youtubeVideo.active, true))
    .orderBy(asc(youtubeVideo.sortOrder));

  return NextResponse.json({ videos: rows });
}
