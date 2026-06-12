import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { preparePayment } from "@/lib/payphone";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const priceCents = Number(process.env.PREMIUM_PRICE_CENTS ?? 1000);

  // Generate a unique transaction ID
  const clientTransactionId = `${session.user.id}_${Date.now()}`;

  try {
    const result = await preparePayment({
      amount: priceCents,
      clientTransactionId,
      reference: "Acceso Premium Ecuacity — 30 días",
      email: session.user.email ?? undefined,
      responseUrl: `${process.env.PAYPHONE_RESPONSE_URL ?? `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/payphone/confirm`}`,
      cancellationUrl: process.env.PAYPHONE_CANCELLATION_URL ?? "/students/upgrade",
    });

    return NextResponse.json({
      paymentId: result.paymentId,
      url: result.payWithCard,
      urlPayPhone: result.payWithPayPhone,
      clientTransactionId,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al preparar pago";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
