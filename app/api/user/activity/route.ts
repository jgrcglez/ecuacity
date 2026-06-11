import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { userProgress, question } from "@/lib/db/schema/questions-schema";
import { eq, desc } from "drizzle-orm";

// ─── GET — recent activity ──────────────────────────────
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "10"), 50);

  const rows = await db
    .select({
      questionId: userProgress.questionId,
      questionText: question.text,
      isCorrect: userProgress.isCorrect,
      answeredAt: userProgress.answeredAt,
    })
    .from(userProgress)
    .leftJoin(question, eq(userProgress.questionId, question.id))
    .where(eq(userProgress.userId, userId))
    .orderBy(desc(userProgress.answeredAt))
    .limit(limit);

  return NextResponse.json({ activity: rows });
}
