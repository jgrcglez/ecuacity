import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { question, answerOption, userProgress } from "@/lib/db/schema/questions-schema";
import { and, eq } from "drizzle-orm";

// ─── POST — submit an answer ────────────────────────────
// Server verifies correctness. isCorrect never comes from client.
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { questionId, selectedOptionId } = body;

  if (!questionId || !selectedOptionId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Verify question + get correct answer + check existing progress (parallel)
  const [qRows, correctRows, existingRows] = await Promise.all([
    db.select({ id: question.id }).from(question).where(eq(question.id, questionId)).limit(1),
    db.select({ id: answerOption.id }).from(answerOption).where(and(eq(answerOption.questionId, questionId), eq(answerOption.isCorrect, true))).limit(1),
    db.select({ id: userProgress.id }).from(userProgress).where(and(eq(userProgress.userId, userId), eq(userProgress.questionId, questionId))).limit(1),
  ]);

  const [q] = qRows;
  const [correct] = correctRows;
  const [existing] = existingRows;

  if (!q) {
    return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
  }
  if (!correct) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  const isCorrect = selectedOptionId === correct.id;

  if (existing) {
    await db
      .update(userProgress)
      .set({
        selectedOptionId,
        isCorrect,
        answeredAt: new Date(),
      })
      .where(eq(userProgress.id, existing.id));
  } else {
    await db.insert(userProgress).values({
      userId,
      questionId,
      selectedOptionId,
      isCorrect,
    });
  }

  return NextResponse.json({
    isCorrect,
    correctOptionId: correct.id,
  });
}
