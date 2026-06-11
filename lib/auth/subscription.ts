import { db } from "@/lib/db/drizzle";
import { subscription } from "@/lib/db/schema/subscription-schema";
import { eq } from "drizzle-orm";

export type Plan = "free" | "premium";

export async function getUserPlan(userId: string): Promise<Plan> {
  const [sub] = await db
    .select({ plan: subscription.plan })
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);
  return (sub?.plan as Plan) ?? "free";
}
