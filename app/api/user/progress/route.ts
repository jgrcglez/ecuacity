import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { userProgress, question } from "@/lib/db/schema/questions-schema";
import { eq, sql } from "drizzle-orm";

// ─── GET — absolute progress stats (never reset) ────────
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  // Total questions in the bank
  const [bankRow] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(question)
    .where(eq(question.status, "active"));

  const bankTotal = bankRow?.total ?? 0;

  // All user progress rows ordered by time
  const rows = await db
    .select({
      questionId: userProgress.questionId,
      isCorrect: userProgress.isCorrect,
    })
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .orderBy(userProgress.answeredAt);

  // Build per-question stats from ALL history
  // totalAttempted: distinct questions ever attempted
  // everCorrect: set of questions answered correctly at least once
  // latestCorrect: whether the latest attempt for each question was correct
  const everCorrect = new Set<string>();
  const attempted = new Set<string>();
  const latestStatus = new Map<string, boolean>();

  for (const r of rows) {
    if (r.isCorrect) everCorrect.add(r.questionId);
    attempted.add(r.questionId);
    latestStatus.set(r.questionId, r.isCorrect);
  }

  const totalAnswered = attempted.size;
  const totalCorrect = everCorrect.size;

  // Incorrect = distinct questions where latest attempt is wrong AND
  // they have NEVER been answered correctly (still "failed")
  let totalIncorrect = 0;
  for (const qId of attempted) {
    const latest = latestStatus.get(qId);
    if (latest === false && !everCorrect.has(qId)) {
      totalIncorrect++;
    }
  }

  return NextResponse.json({
    totalAnswered,
    totalCorrect,
    totalIncorrect,
    totalBank: bankTotal,
    bankCorrectPct: bankTotal > 0 ? Math.round((everCorrect.size / bankTotal) * 100) : 0,
    bankAttemptedPct: bankTotal > 0 ? Math.round((totalAnswered / bankTotal) * 100) : 0,
    bankFailedPct: bankTotal > 0 ? Math.round((totalIncorrect / bankTotal) * 100) : 0,
  });
}

// ─── DELETE — removed. Stats are now absolute and never reset.
export async function DELETE() {
  return NextResponse.json({ error: "Las estadísticas ya no se reinician" }, { status: 400 });
}
