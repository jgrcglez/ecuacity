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
import { eq, sql, and, inArray, notInArray } from "drizzle-orm";

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
// Free:    10 assigned questions, re-servable at any time.
// Premium: the full bank, paginated. Only questions not yet answered
//          in the requested scope, so finishing a scope never dead-ends
//          the client on an empty exam. ?mode=review re-serves answered
//          questions for a deliberate re-practice.
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;
  const url = new URL(request.url);
  const categoryId = url.searchParams.get("categoryId");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const reviewMode = url.searchParams.get("mode") === "review";

  // Check subscription plan
  const [sub] = await db
    .select({ plan: subscription.plan })
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  const isPremium = sub?.plan === "premium";

  if (!isPremium) {
    // ── FREE: assigned questions ──
    const existing = await db
      .select({
        questionId: userQuestionAssignment.questionId,
        sortOrder: userQuestionAssignment.sortOrder,
      })
      .from(userQuestionAssignment)
      .where(eq(userQuestionAssignment.userId, userId))
      .orderBy(userQuestionAssignment.sortOrder);

    let questionIds = existing.map((a) => a.questionId);

    if (questionIds.length === 0) {
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
    }

    // No `remaining` — free users can always redo their assigned set.
    return assembleResponse(questionIds, { total: questionIds.length });
  }

  // ── PREMIUM: full bank, paginated ──
  const scope = categoryId
    ? and(eq(question.status, "active"), eq(question.categoryId, categoryId))
    : eq(question.status, "active");

  const answered = db
    .select({ questionId: userProgress.questionId })
    .from(userProgress)
    .where(eq(userProgress.userId, userId));

  const selectable = reviewMode
    ? scope
    : and(scope, notInArray(question.id, answered));

  const [selectableRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(question)
    .where(selectable);

  const selectableCount = selectableRow?.count ?? 0;

  // In practice mode `total` is the whole scope so the client can tell
  // "scope is empty" apart from "scope is fully answered".
  let total = selectableCount;
  if (!reviewMode) {
    const [scopeRow] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(question)
      .where(scope);
    total = scopeRow?.count ?? 0;
  }

  const totalPages = Math.ceil(selectableCount / PER_PAGE) || 1;
  const safePage = Math.min(page, totalPages);

  const rows =
    selectableCount === 0
      ? []
      : await db
          .select({ id: question.id })
          .from(question)
          .where(selectable)
          .orderBy(sql`random()`)
          .limit(PER_PAGE)
          .offset((safePage - 1) * PER_PAGE);

  return assembleResponse(rows.map((q) => q.id), {
    total,
    ...(reviewMode ? {} : { remaining: selectableCount }),
    page: safePage,
    totalPages,
  });
}

// ─── Shared assembly ──────────────────────────────────────
async function assembleResponse(
  questionIds: string[],
  meta: {
    total: number;
    remaining?: number;
    page?: number;
    totalPages?: number;
  },
) {
  if (questionIds.length === 0) {
    return NextResponse.json({ questions: [], ...meta });
  }

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

  // Options (fetch isCorrect server-side to pick 3)
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

  const optionsByQuestion: Record<string, typeof optionRows> = {};
  for (const opt of optionRows) {
    (optionsByQuestion[opt.questionId] ??= []).push(opt);
  }

  const questions = questionIds
    .map((id) => questionRows.find((r) => r.id === id))
    .filter(Boolean)
    .map((q) => {
      const allOpts = optionsByQuestion[q!.id] ?? [];
      const correct = allOpts.find((o) => o.isCorrect);
      const distractors = allOpts.filter((o) => !o.isCorrect);
      // Pick correct + 2 random distractors (or all if <2 available)
      const picked = [
        correct!,
        ...shuffle(distractors).slice(0, 2),
      ].filter(Boolean);
      // Shuffle final order and strip isCorrect
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
      };
    });

  return NextResponse.json({ questions, ...meta });
}
