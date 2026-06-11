import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth/auth";
import {db} from "@/lib/db/drizzle";
import {question, category, userProgress} from "@/lib/db/schema/questions-schema";
import {user} from "@/lib/auth/auth-schema";
import {sql, eq, ne} from "drizzle-orm";

// ─── GET — dashboard statistics ───────────────────────────
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({headers: request.headers});
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({error: "No autorizado"}, {status: 403});
  }

  const [[{count: totalQ}], [{count: activeQ}], [{count: draftQ}], [{count: totalC}], [{count: totalU}], progressRows] =
    await Promise.all([
      db.select({count: sql<number>`count(*)`}).from(question),
      db.select({count: sql<number>`count(*)`}).from(question).where(eq(question.status, "active")),
      db.select({count: sql<number>`count(*)`}).from(question).where(eq(question.status, "draft")),
      db.select({count: sql<number>`count(*)`}).from(category),
      db.select({count: sql<number>`count(*)`}).from(user).where(ne(user.role, "admin")),
      db
        .select({
          total: sql<number>`count(*)`,
          correct: sql<number>`count(*) filter (where ${userProgress.isCorrect} = true)`,
        })
        .from(userProgress),
    ]);

  const totalAnswers = Number(progressRows[0]?.total ?? 0);
  const correctAnswers = Number(progressRows[0]?.correct ?? 0);
  const approvalRate = totalAnswers > 0
    ? Math.round((correctAnswers / totalAnswers) * 100)
    : 0;

  return NextResponse.json({
    questions: Number(totalQ),
    activeQuestions: Number(activeQ),
    draftQuestions: Number(draftQ),
    categories: Number(totalC),
    users: Number(totalU),
    approvalRate,
  });
}
