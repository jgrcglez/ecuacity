import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import {
  userQuestionAssignment,
  question,
  answerOption,
  category,
  userProgress,
} from "@/lib/db/schema/questions-schema";
import { subscription } from "@/lib/db/schema/subscription-schema";
import { eq, sql, and, inArray } from "drizzle-orm";

const PER_PAGE = 10;
const ASSIGNMENT_COUNT = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── GET — user's questions ──────────────────────────────
// Free: 10 assigned questions. Premium: full bank, optional
// categoryId + page for pagination.
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;
  const url = new URL(request.url);
  const categoryId = url.searchParams.get("categoryId");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));

  // Check subscription plan
  const [sub] = await db
    .select({ plan: subscription.plan })
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  const isPremium = sub?.plan === "premium";

  let questionIds: string[];
  let total = 0;
  let totalPages = 1;

  if (!isPremium) {
    // ── FREE: assigned questions (existing flow) ──
    const existing = await db
      .select({
        questionId: userQuestionAssignment.questionId,
        sortOrder: userQuestionAssignment.sortOrder,
      })
      .from(userQuestionAssignment)
      .where(eq(userQuestionAssignment.userId, userId))
      .orderBy(userQuestionAssignment.sortOrder);

    if (existing.length === 0) {
      const random = await db
        .select({ id: question.id })
        .from(question)
        .where(eq(question.status, "active"))
        .orderBy(sql`random()`)
        .limit(ASSIGNMENT_COUNT);

      if (random.length === 0) {
        return NextResponse.json({ questions: [], total: 0 });
      }

      await db.insert(userQuestionAssignment).values(
        random.map((q, i) => ({ userId, questionId: q.id, sortOrder: i })),
      );

      questionIds = random.map((q) => q.id);
    } else {
      questionIds = existing.map((a) => a.questionId);
    }

    total = questionIds.length;
    totalPages = 1;

    return assembleResponse(userId, questionIds, total, totalPages, null);
  }

  // ── PREMIUM: full bank, paginated ──
  const whereClause = categoryId
    ? and(eq(question.status, "active"), eq(question.categoryId, categoryId))
    : eq(question.status, "active");

  const [countRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(question)
    .where(whereClause);

  total = countRow?.count ?? 0;
  totalPages = Math.ceil(total / PER_PAGE) || 1;
  const safePage = Math.min(page, totalPages);

  const rows = await db
    .select({ id: question.id })
    .from(question)
    .where(whereClause)
    .orderBy(sql`random()`)
    .limit(PER_PAGE)
    .offset((safePage - 1) * PER_PAGE);

  questionIds = rows.map((q) => q.id);

  return assembleResponse(userId, questionIds, total, totalPages, {
    page: safePage,
    totalPages,
  });
}

// ─── Shared assembly ──────────────────────────────────────
async function assembleResponse(
  userId: string,
  questionIds: string[],
  total: number,
  totalPages: number,
  pagination: { page: number; totalPages: number } | null,
) {
  // Questions with category
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

  // Options (isCorrect stripped)
  const optionRows = await db
    .select({
      id: answerOption.id,
      questionId: answerOption.questionId,
      text: answerOption.text,
      order: answerOption.order,
    })
    .from(answerOption)
    .where(inArray(answerOption.questionId, questionIds))
    .orderBy(answerOption.order);

  // Progress
  const progressRows = await db
    .select({
      questionId: userProgress.questionId,
      selectedOptionId: userProgress.selectedOptionId,
      isCorrect: userProgress.isCorrect,
    })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        inArray(userProgress.questionId, questionIds),
      ),
    );

  const progressMap: Record<string, { selectedOptionId: string; isCorrect: boolean }> = {};
  for (const p of progressRows) {
    progressMap[p.questionId] = { selectedOptionId: p.selectedOptionId, isCorrect: p.isCorrect };
  }

  const optionsByQuestion: Record<string, typeof optionRows> = {};
  for (const opt of optionRows) {
    (optionsByQuestion[opt.questionId] ??= []).push(opt);
  }

  const questions = questionIds
    .map((id) => questionRows.find((r) => r.id === id))
    .filter(Boolean)
    .map((q) => ({
      id: q!.id,
      text: q!.text,
      categoryName: q!.categoryName ?? "",
      imageUrl: q!.imageUrl,
      options: shuffle(optionsByQuestion[q!.id] ?? []).map((o) => ({
        id: o.id,
        text: o.text,
        order: o.order,
      })),
      progress: progressMap[q!.id] ?? null,
    }));

  const response: Record<string, unknown> = { questions, total };

  if (pagination) {
    response.page = pagination.page;
    response.totalPages = pagination.totalPages;
  }

  return NextResponse.json(response);
}
