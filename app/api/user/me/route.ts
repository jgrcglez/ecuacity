import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { subscription } from "@/lib/db/schema/subscription-schema";
import { eq } from "drizzle-orm";

// ─── GET — current user + subscription ──────────────────
// Auto-creates a free subscription if one doesn't exist.
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { user } = session;

  // Get or create subscription
  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, user.id))
    .limit(1);

  let subData = sub;

  if (!subData) {
    const [created] = await db
      .insert(subscription)
      .values({ userId: user.id, plan: "free", status: "active" })
      .returning();
    subData = created;
  }

  // Compute premium status from expiresAt
  const now = new Date();
  const expiresAt = subData.expiresAt ? new Date(subData.expiresAt) : null;
  const isPremium = subData.plan === "premium" && expiresAt !== null && expiresAt > now;

  // If premium but expired, auto-revert to free
  if (subData.plan === "premium" && expiresAt !== null && expiresAt <= now) {
    await db
      .update(subscription)
      .set({ plan: "free", status: "expired" })
      .where(eq(subscription.userId, user.id));
    subData.plan = "free";
    subData.status = "expired";
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    subscription: {
      plan: subData.plan,
      status: subData.status,
      isPremium,
      expiresAt: expiresAt?.toISOString() ?? null,
    },
  });
}
