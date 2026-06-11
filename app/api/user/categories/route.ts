import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { category, question } from "@/lib/db/schema/questions-schema";
import { getUserPlan } from "@/lib/auth/subscription";
import { eq, asc, sql } from "drizzle-orm";

// ─── GET — categories with question counts (premium only) ─
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const plan = await getUserPlan(session.user.id);
  if (plan !== "premium") {
    return NextResponse.json(
      { error: "Plan Premium requerido", categories: [] },
      { status: 402 },
    );
  }

  const rows = await db
    .select({
      id: category.id,
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      questionCount: sql<number>`cast(count(${question.id}) as int)`,
    })
    .from(category)
    .leftJoin(question, eq(category.id, question.categoryId))
    .where(eq(question.status, "active"))
    .groupBy(category.id, category.name, category.description, category.sortOrder)
    .orderBy(asc(category.sortOrder));

  return NextResponse.json({ categories: rows });
}
