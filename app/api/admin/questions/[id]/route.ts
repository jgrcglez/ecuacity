import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth/auth";
import {db} from "@/lib/db/drizzle";
import {question, answerOption} from "@/lib/db/schema/questions-schema";
import {eq} from "drizzle-orm";

// ─── PUT — update question + replace answers ─────────────
export async function PUT(
  request: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const session = await auth.api.getSession({headers: request.headers});
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({error: "No autorizado"}, {status: 403});
  }

  const {id} = await params;
  const body = await request.json();
  const {text, categoryId, status, imageUrl, answers} = body;

  const existing = await db.select().from(question).where(eq(question.id, id)).limit(1);
  if (existing.length === 0) {
    return NextResponse.json({error: "Pregunta no encontrada"}, {status: 404});
  }

  await db
    .update(question)
    .set({
      text: text?.trim(),
      categoryId,
      status,
      imageUrl: imageUrl || null,
    })
    .where(eq(question.id, id));

  // Replace all answer options
  if (answers) {
    await db.delete(answerOption).where(eq(answerOption.questionId, id));
    await db.insert(answerOption).values(
      answers.map((a: {text: string; isCorrect: boolean; order: number}, i: number) => ({
        questionId: id,
        text: a.text.trim(),
        isCorrect: a.isCorrect ?? false,
        order: a.order ?? i,
      })),
    );
  }

  return NextResponse.json({success: true});
}

// ─── DELETE — delete question (cascades to answers) ──────
export async function DELETE(
  request: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const session = await auth.api.getSession({headers: request.headers});
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({error: "No autorizado"}, {status: 403});
  }

  const {id} = await params;

  const existing = await db.select().from(question).where(eq(question.id, id)).limit(1);
  if (existing.length === 0) {
    return NextResponse.json({error: "Pregunta no encontrada"}, {status: 404});
  }

  await db.delete(question).where(eq(question.id, id));

  return NextResponse.json({success: true});
}
