import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth/auth";
import {db} from "@/lib/db/drizzle";
import {category, question, answerOption} from "@/lib/db/schema/questions-schema";
import {eq, ilike, sql, asc, inArray} from "drizzle-orm";

const ITEMS_PER_PAGE = 10;

// ─── GET — paginated questions list ───────────────────────
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({headers: request.headers});
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({error: "No autorizado"}, {status: 403});
  }

  const {searchParams} = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search")?.trim() ?? "";
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const where = search
    ? ilike(question.text, `%${search}%`)
    : undefined;

  const categories = await db
    .select()
    .from(category)
    .orderBy(asc(category.sortOrder));

  const [total, rows] = await Promise.all([
    db.select({count: sql<number>`count(*)`}).from(question).where(where).then((r) => Number(r[0].count)),
    db
      .select({
        id: question.id,
        text: question.text,
        categoryId: question.categoryId,
        categoryName: category.name,
        order: question.order,
        status: question.status,
        imageUrl: question.imageUrl,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      })
      .from(question)
      .leftJoin(category, eq(question.categoryId, category.id))
      .where(where)
      .orderBy(question.order, question.createdAt)
      .limit(ITEMS_PER_PAGE)
      .offset(offset),
  ]);

  // Fetch answer options for all questions on this page
  if (rows.length === 0) {
    return NextResponse.json({questions: [], categories, page, totalPages: 1, total: 0});
  }

  const questionIds = rows.map((r) => r.id);
  const options = await db
    .select()
    .from(answerOption)
    .where(inArray(answerOption.questionId, questionIds))
    .orderBy(answerOption.order);

  const optionsByQuestion = new Map<string, typeof options>();
  for (const opt of options) {
    const list = optionsByQuestion.get(opt.questionId) ?? [];
    list.push(opt);
    optionsByQuestion.set(opt.questionId, list);
  }

  const questions = rows.map((r) => ({
    ...r,
    answers: optionsByQuestion.get(r.id) ?? [],
  }));

  return NextResponse.json({
    questions,
    categories,
    page,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    total,
  });
}

// ─── POST — create question with answers ──────────────────
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({headers: request.headers});
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({error: "No autorizado"}, {status: 403});
  }

  const body = await request.json();
  const {text, categoryId, status, imageUrl, answers} = body;

  if (!text?.trim() || !categoryId || !answers?.length) {
    return NextResponse.json({error: "Faltan campos requeridos"}, {status: 400});
  }

  const [created] = await db
    .insert(question)
    .values({
      text: text.trim(),
      categoryId,
      status: status ?? "active",
      imageUrl: imageUrl || null,
      order: 0,
    })
    .returning();

  if (answers.length > 0) {
    await db.insert(answerOption).values(
      answers.map((a: {text: string; isCorrect: boolean; order: number}, i: number) => ({
        questionId: created.id,
        text: a.text.trim(),
        isCorrect: a.isCorrect ?? false,
        order: a.order ?? i,
      })),
    );
  }

  return NextResponse.json({question: created}, {status: 201});
}
