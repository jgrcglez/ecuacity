import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { payment } from "@/lib/db/schema/payment-schema";
import { user } from "@/lib/auth/auth-schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 20;
  const offset = (page - 1) * limit;

  // Summary stats
  const [stats] = await db
    .select({
      totalGross: sql<number>`COALESCE(SUM(${payment.amount}), 0)`,
      totalCommission: sql<number>`COALESCE(SUM(${payment.commission}), 0)`,
      totalNet: sql<number>`COALESCE(SUM(${payment.netAmount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(payment)
    .where(eq(payment.status, "approved"));

  // Paginated payments with user info
  const rows = await db
    .select({
      id: payment.id,
      userId: payment.userId,
      userName: user.name,
      userEmail: user.email,
      transactionId: payment.transactionId,
      amount: payment.amount,
      commission: payment.commission,
      netAmount: payment.netAmount,
      status: payment.status,
      cardBrand: payment.cardBrand,
      cardType: payment.cardType,
      authorizationCode: payment.authorizationCode,
      reference: payment.reference,
      createdAt: payment.createdAt,
    })
    .from(payment)
    .leftJoin(user, eq(payment.userId, user.id))
    .where(eq(payment.status, "approved"))
    .orderBy(desc(payment.createdAt))
    .limit(limit)
    .offset(offset);

  // Total count for pagination
  const [countResult] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(payment)
    .where(eq(payment.status, "approved"));

  const total = Number(countResult?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({
    payments: rows,
    stats: {
      totalGross: Number(stats?.totalGross ?? 0),
      totalCommission: Number(stats?.totalCommission ?? 0),
      totalNet: Number(stats?.totalNet ?? 0),
      count: Number(stats?.count ?? 0),
    },
    page,
    totalPages,
    total,
  });
}
