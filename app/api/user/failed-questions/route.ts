import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import {
  question,
  answerOption,
  category,
  userProgress,
} from "@/lib/db/schema/questions-schema";
import { subscription } from "@/lib/db/schema/subscription-schema";
import { eq, and, inArray } from "drizzle-orm";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  // Only premium users
  const [sub] = await db
    .select({ plan: subscription.plan })
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  if (sub?.plan !== "premium") {
    return NextResponse.json({ error: "Solo para usuarios Premium" }, { status: 403 });
  }

  // Get ALL progress rows to build per-question status
  const allRows = await db
    .select({
      questionId: userProgress.questionId,
      isCorrect: userProgress.isCorrect,
    })
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .orderBy(userProgress.answeredAt);

  // Build: which questions were ever correct, and what's the latest status
  const everCorrect = new Set<string>();
  const latestStatus = new Map<string, boolean>();
  for (const r of allRows) {
    if (r.isCorrect) everCorrect.add(r.questionId);
    latestStatus.set(r.questionId, r.isCorrect);
  }

  // Failed = latest attempt is wrong AND never answered correctly
  const questionIds: string[] = [];
  for (const [qId, isCorrect] of latestStatus) {
    if (!isCorrect && !everCorrect.has(qId)) {
      questionIds.push(qId);
    }
  }
  questionIds.splice(50); // max 50
  if (questionIds.length === 0) {
    return NextResponse.json({ questions: [], total: 0 });
  }

  // Fetch questions with category
  const questionRows = await db
    .select({
      id: question.id,
      text: question.text,
      imageUrl: question.imageUrl,
      categoryName: category.name,
    })
    .from(question)
    .leftJoin(category, eq(question.categoryId, category.id))
    .where(inArray(question.id, questionIds));

  // Fetch options (with isCorrect for server-side 3-option pick)
  const optionRows = await db
    .select({
      id: answerOption.id,
      questionId: answerOption.questionId,
      text: answerOption.text,
      order: answerOption.order,
      isCorrect: answerOption.isCorrect,
    })
    .from(answerOption)
    .where(inArray(answerOption.questionId, questionIds))
    .orderBy(answerOption.order);

  // Group options by question
  const optsByQ: Record<string, typeof optionRows> = {};
  for (const opt of optionRows) {
    (optsByQ[opt.questionId] ??= []).push(opt);
  }

  // Assemble: correct answer + 2 random distractors
  const questions = questionIds
    .map((id) => questionRows.find((r) => r.id === id))
    .filter(Boolean)
    .map((q) => {
      const all = optsByQ[q!.id] ?? [];
      const correct = all.find((o) => o.isCorrect);
      const distractors = all.filter((o) => !o.isCorrect);
      const picked = [
        correct!,
        ...shuffle(distractors).slice(0, 2),
      ].filter(Boolean);
      return {
        id: q!.id,
        text: q!.text,
        categoryName: q!.categoryName ?? "",
        imageUrl: q!.imageUrl,
        options: shuffle(picked).map((o, i) => ({
          id: o.id,
          text: o.text,
          order: i,
        })),
        progress: null, // fresh attempt
      };
    });

  return NextResponse.json({ questions, total: questions.length });
}
