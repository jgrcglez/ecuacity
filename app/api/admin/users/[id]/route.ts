import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { subscription } from "@/lib/db/schema/subscription-schema";
import { eq } from "drizzle-orm";

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauth = await requireAdmin(request);
  if (unauth) return unauth;

  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case "toggleRole": {
        const targetRole = body.role === "admin" ? "admin" : "user";
        await auth.api.setRole({
          headers: request.headers,
          body: { userId: id, role: targetRole },
        });
        return NextResponse.json({ success: true, role: targetRole });
      }

      case "ban": {
        await auth.api.banUser({
          headers: request.headers,
          body: {
            userId: id,
            banReason: body.banReason ?? null,
            banExpiresIn: body.banExpiresIn ?? null,
          },
        });
        return NextResponse.json({ success: true, banned: true });
      }

      case "unban": {
        await auth.api.unbanUser({
          headers: request.headers,
          body: { userId: id },
        });
        return NextResponse.json({ success: true, banned: false });
      }

      case "resetPassword": {
        if (!body.newPassword || body.newPassword.length < 6) {
          return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
        }
        await auth.api.setUserPassword({
          headers: request.headers,
          body: { userId: id, newPassword: body.newPassword },
        });
        return NextResponse.json({ success: true });
      }

      case "togglePlan": {
        const plan = body.plan === "premium" ? "premium" : "free";

        // Admin promotions are permanent — set a far-future expiry so
        // the isPremium check at /api/user/me (plan + expiresAt > now)
        // works correctly. When demoting, clear expiresAt.
        const expiresAt =
          plan === "premium" ? new Date(Date.now() + 365_000 * 24 * 60 * 60 * 1000) : null;

        const [existing] = await db
          .select({ id: subscription.id })
          .from(subscription)
          .where(eq(subscription.userId, id))
          .limit(1);

        if (existing) {
          await db
            .update(subscription)
            .set({ plan, status: "active", expiresAt })
            .where(eq(subscription.userId, id));
        } else {
          await db.insert(subscription).values({
            userId: id,
            plan,
            status: "active",
            expiresAt,
          });
        }
        return NextResponse.json({ success: true, plan });
      }

      case "revokeSessions": {
        await auth.api.revokeUserSessions({
          headers: request.headers,
          body: { userId: id },
        });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauth = await requireAdmin(request);
  if (unauth) return unauth;

  const { id } = await params;

  try {
    await auth.api.removeUser({
      headers: request.headers,
      body: { userId: id },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}
