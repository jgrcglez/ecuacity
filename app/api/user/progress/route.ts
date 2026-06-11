import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { userProgress } from "@/lib/db/schema/questions-schema";
import { eq, sql } from "drizzle-orm";

// ─── GET — progress summary ────────────────────────────
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  const [row] = await db
    .select({
      totalAnswered: sql<number>`cast(count(*) as int)`,
      totalCorrect: sql<number>`cast(sum(case when ${userProgress.isCorrect} then 1 else 0 end) as int)`,
      totalIncorrect: sql<number>`cast(sum(case when ${userProgress.isCorrect} then 0 else 1 end) as int)`,
    })
    .from(userProgress)
    .where(eq(userProgress.userId, userId));

  return NextResponse.json({
    totalAnswered: row?.totalAnswered ?? 0,
    totalCorrect: row?.totalCorrect ?? 0,
    totalIncorrect: row?.totalIncorrect ?? 0,
  });
}

// ─── DELETE — reset progress (retake same questions) ────
export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  await db.delete(userProgress).where(eq(userProgress.userId, userId));

  return NextResponse.json({ success: true });
}
