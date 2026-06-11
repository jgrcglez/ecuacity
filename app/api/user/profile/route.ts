import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

// ─── PATCH — update user profile (name, image) ────────────
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { name, image, currentPassword, newPassword } = body;

  const result: Record<string, unknown> = { success: true };

  // ── Name / image update ──
  if (name || image !== undefined) {
    const payload: Record<string, unknown> = {};
    if (name?.trim()) payload.name = name.trim();
    if (image !== undefined) payload.image = image || null;

    if (Object.keys(payload).length > 0) {
      try {
        await auth.api.updateUser({
          body: payload,
          headers: request.headers,
        });
        // Client uses updateUser() from auth-client.ts + refetch() to sync
        if (name?.trim()) result.name = name.trim();
        if (image !== undefined) result.image = image || null;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Error al actualizar";
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }
  }

  // ── Password change ──
  if (currentPassword && newPassword) {
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      );
    }

    try {
      await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        headers: request.headers,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al cambiar contraseña";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  return NextResponse.json(result);
}
