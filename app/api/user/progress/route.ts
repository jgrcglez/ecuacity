import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { userProgress } from "@/lib/db/schema/questions-schema";
import { eq } from "drizzle-orm";

// ─── GET — progress summary ────────────────────────────
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  // Count distinct questions (latest attempt per question)
  const rows = await db
    .select({
      questionId: userProgress.questionId,
      isCorrect: userProgress.isCorrect,
      answeredAt: userProgress.answeredAt,
    })
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .orderBy(userProgress.answeredAt);

  // Latest attempt per question (manual dedup since insert preserves history)
  const latest = new Map<string, { isCorrect: boolean }>();
  for (const r of rows) {
    latest.set(r.questionId, { isCorrect: r.isCorrect });
  }

  let correct = 0;
  for (const v of latest.values()) {
    if (v.isCorrect) correct++;
  }

  return NextResponse.json({
    totalAnswered: latest.size,
    totalCorrect: correct,
    totalIncorrect: latest.size - correct,
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
