import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { user } from "@/lib/auth/auth-schema";
import { userProgress } from "@/lib/db/schema/questions-schema";
import { subscription } from "@/lib/db/schema/subscription-schema";
import { sql, ilike, or, and, asc, inArray, eq, type SQL } from "drizzle-orm";

const ITEMS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search")?.trim() ?? "";
  const planFilter = searchParams.get("plan")?.trim() ?? "";
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Build search + filter conditions
  const conditions: SQL[] = [];

  if (search) {
    conditions.push(
      or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))!,
    );
  }

  if (planFilter === "admin") {
    conditions.push(eq(user.role, "admin"));
  } else if (planFilter === "premium" || planFilter === "free") {
    conditions.push(eq(user.role, "user"));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const baseQuery = db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      createdAt: user.createdAt,
    })
    .from(user);

  const [[{ count: total }], rows] = await Promise.all([
    where
      ? db.select({ count: sql<number>`count(*)` }).from(user).where(where)
      : db.select({ count: sql<number>`count(*)` }).from(user),
    where
      ? baseQuery.where(where).orderBy(asc(user.createdAt)).limit(ITEMS_PER_PAGE).offset(offset)
      : baseQuery.orderBy(asc(user.createdAt)).limit(ITEMS_PER_PAGE).offset(offset),
  ]);

  const userIds = rows.map((r) => r.id);

  const stats = userIds.length > 0
    ? await db
        .select({
          userId: userProgress.userId,
          total: sql<number>`count(*)`,
          correct: sql<number>`count(*) filter (where ${userProgress.isCorrect} = true)`,
        })
        .from(userProgress)
        .where(inArray(userProgress.userId, userIds))
        .groupBy(userProgress.userId)
    : [];
  const statsMap = new Map(stats.map((s) => [s.userId, s]));

  const subRows = userIds.length > 0
    ? await db
        .select({ userId: subscription.userId, plan: subscription.plan })
        .from(subscription)
        .where(inArray(subscription.userId, userIds))
    : [];
  const planMap = new Map(subRows.map((s) => [s.userId, s.plan]));

  let users = rows.map((r) => {
    const s = statsMap.get(r.id);
    return {
      ...r,
      plan: planMap.get(r.id) ?? "free",
      questionsAnswered: s ? Number(s.total) : 0,
      correctAnswers: s ? Number(s.correct) : 0,
      successRate: s && Number(s.total) > 0
        ? Math.round((Number(s.correct) / Number(s.total)) * 100)
        : null,
    };
  });

  if (planFilter === "premium") {
    users = users.filter((u) => u.plan === "premium");
  } else if (planFilter === "free") {
    users = users.filter((u) => u.plan === "free");
  }

  return NextResponse.json({
    users,
    page,
    totalPages: Math.ceil(Number(total) / ITEMS_PER_PAGE),
    total: Number(total),
  });
}
