import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const result = await auth.api.listUserSessions({
      headers: request.headers,
      body: { userId: id },
    });
    return NextResponse.json({ sessions: result.sessions });
  } catch {
    return NextResponse.json({ error: "Error al obtener sesiones" }, { status: 500 });
  }
}
