import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { subscription } from "@/lib/db/schema/subscription-schema";
import { eq } from "drizzle-orm";
import { confirmPayment } from "@/lib/payphone";

/**
 * Payphone redirects the user here after payment (?id=...&clientTransactionId=...).
 *
 * This endpoint:
 * 1. Calls Payphone Confirm API to verify the transaction
 * 2. If approved, sets the user's subscription to premium with 30-day expiry
 * 3. Redirects the user to the dashboard
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const clientTxId = searchParams.get("clientTransactionId");

  if (!id || !clientTxId) {
    return NextResponse.redirect(new URL("/students/upgrade?error=missing_params", request.url));
  }

  try {
    const result = await confirmPayment({
      id: Number(id),
      clientTxId,
    });

    if (result.statusCode !== 3) {
      return NextResponse.redirect(new URL("/students/upgrade?error=canceled", request.url));
    }

    // Extract userId from clientTransactionId (format: userId_timestamp)
    const userId = clientTxId.split("_")[0];
    if (!userId) {
      return NextResponse.redirect(new URL("/students/upgrade?error=invalid_tx", request.url));
    }

    const durationDays = Number(process.env.PREMIUM_DURATION_DAYS ?? 30);
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    // Upsert subscription — premium until expiresAt
    await db
      .insert(subscription)
      .values({
        userId,
        plan: "premium",
        status: "active",
        startedAt: new Date(),
        expiresAt,
      })
      .onConflictDoUpdate({
        target: subscription.userId,
        set: {
          plan: "premium",
          status: "active",
          startedAt: new Date(),
          expiresAt,
        },
      });

    return NextResponse.redirect(new URL(`/students/upgrade?success=true&days=${durationDays}`, request.url));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al confirmar pago";
    return NextResponse.redirect(new URL(`/students/upgrade?error=${encodeURIComponent(msg)}`, request.url));
  }
}
