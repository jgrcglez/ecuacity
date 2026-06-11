import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { user as userTable } from "@/lib/auth/auth-schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Correo requerido" }, { status: 400 });
    }

    // Find user and check cooldown
    const [record] = await db
      .select({
        id: userTable.id,
        emailVerified: userTable.emailVerified,
        sentAt: userTable.verificationEmailSentAt,
      })
      .from(userTable)
      .where(eq(userTable.email, email.toLowerCase()))
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (record.emailVerified) {
      return NextResponse.json({ error: "El correo ya está verificado" }, { status: 400 });
    }

    // 5-minute cooldown
    if (record.sentAt) {
      const elapsed = Date.now() - new Date(record.sentAt).getTime();
      const remaining = Math.ceil((5 * 60 * 1000 - elapsed) / 1000);
      if (remaining > 0) {
        return NextResponse.json({
          error: `Espera ${remaining} segundos antes de solicitar otro correo`,
          remaining,
        }, { status: 429 });
      }
    }

    // Trigger Better Auth to send verification email
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: "/students/dashboard" },
      headers: request.headers,
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al enviar correo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
