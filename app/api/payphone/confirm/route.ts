import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { subscription } from "@/lib/db/schema/subscription-schema";
import { payment } from "@/lib/db/schema/payment-schema";
import { eq } from "drizzle-orm";
import { confirmPayment } from "@/lib/payphone";

/** Payphone effective commission: 5% + 15% VAT on the fee = 5.75% */
const PAYPHONE_COMMISSION_RATE = 0.0575;

/**
 * Payphone redirects the user here after payment (?id=...&clientTransactionId=...).
 *
 * This endpoint:
 * 1. Calls Payphone Confirm API to verify the transaction
 * 2. If approved, sets the user's subscription to premium with 30-day expiry
 * 3. Redirects the user to the dashboard
 */
/**
 * Extract payment identifiers from URL search params or request body,
 * trying the various parameter names Payphone might use.
 */
function extractPaymentParams(
  searchParams: URLSearchParams,
  body?: Record<string, unknown> | null,
): { id: string | null; clientTxId: string | null } {
  const get = (...keys: string[]) => {
    for (const key of keys) {
      const fromParams = searchParams.get(key);
      if (fromParams) return fromParams;
      if (body?.[key] !== undefined) return String(body[key]);
    }
    return null;
  };

  return {
    id: get("id", "paymentId", "transactionId", "PaymentId"),
    clientTxId: get(
      "clientTransactionId",
      "clientTxId",
      "ClientTransactionId",
      "client_transaction_id",
    ),
  };
}

async function handleConfirm(
  id: string,
  clientTxId: string,
  requestUrl: URL,
): Promise<NextResponse> {
  try {
    const result = await confirmPayment({ id: Number(id), clientTxId });

    if (result.statusCode !== 3) {
      return NextResponse.redirect(new URL("/students/upgrade?error=canceled", requestUrl));
    }

    // Extract userId from clientTransactionId (format: userId_timestamp)
    const userId = clientTxId.split("_")[0];
    if (!userId) {
      return NextResponse.redirect(new URL("/students/upgrade?error=invalid_tx", requestUrl));
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

    // Record the payment for auditing
    const amount = result.amount;
    const commission = Math.round(amount * PAYPHONE_COMMISSION_RATE);
    const netAmount = amount - commission;

    await db.insert(payment).values({
      userId,
      transactionId: String(result.transactionId),
      clientTransactionId: clientTxId,
      amount,
      commission,
      netAmount,
      status: "approved",
      reference: "Acceso Premium Ecuacity",
      cardBrand: result.cardBrand,
      cardType: result.cardType,
      authorizationCode: result.authorizationCode,
    });

    return NextResponse.redirect(
      new URL(`/students/upgrade?success=true&days=${durationDays}`, requestUrl),
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al confirmar pago";
    return NextResponse.redirect(
      new URL(`/students/upgrade?error=${encodeURIComponent(msg)}`, requestUrl),
    );
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  console.log("Payphone confirm GET — full URL:", requestUrl.toString());

  const allParams: Record<string, string> = {};
  requestUrl.searchParams.forEach((v, k) => { allParams[k] = v; });
  console.log("Payphone confirm — GET params:", JSON.stringify(allParams));

  const { id, clientTxId } = extractPaymentParams(requestUrl.searchParams);

  if (!id || !clientTxId) {
    console.error("Payphone confirm — missing GET params. id=", id, "clientTxId=", clientTxId);
    return NextResponse.redirect(new URL("/students/upgrade?error=missing_params", request.url));
  }

  return handleConfirm(id, clientTxId, requestUrl);
}

export async function POST(request: NextRequest) {
  console.log("Payphone confirm POST — called");

  let body: Record<string, unknown> | null = null;
  try {
    body = await request.json();
    console.log("Payphone confirm — POST body:", JSON.stringify(body));
  } catch {
    try {
      const formData = await request.formData();
      body = {};
      formData.forEach((value, key) => { (body as Record<string, string>)[key] = String(value); });
      console.log("Payphone confirm — POST formData:", JSON.stringify(body));
    } catch {
      console.log("Payphone confirm — POST body unreadable");
    }
  }

  const requestUrl = new URL(request.url);

  // For POST, parameters might be in the body or query string
  const { id, clientTxId } = extractPaymentParams(requestUrl.searchParams, body);

  if (!id || !clientTxId) {
    console.error("Payphone confirm — missing POST params. body=", JSON.stringify(body));
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  return handleConfirm(id, clientTxId, requestUrl);
}
