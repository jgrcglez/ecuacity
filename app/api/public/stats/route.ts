import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { question, category, userProgress } from "@/lib/db/schema/questions-schema";
import { user } from "@/lib/auth/auth-schema";
import { eq, sql } from "drizzle-orm";

// ─── GET — public aggregate stats (non-sensitive) ────────
export async function GET() {
  const [questionRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(question)
    .where(eq(question.status, "active"));

  const [categoryRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(category);

  const [userRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(user);

  const [answeredRow] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(userProgress);

  return NextResponse.json({
    totalQuestions: questionRow?.count ?? 0,
    totalCategories: categoryRow?.count ?? 0,
    totalUsers: userRow?.count ?? 0,
    totalAnswered: answeredRow?.total ?? 0,
  });
}
