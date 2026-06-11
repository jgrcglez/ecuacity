import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth/auth";
import {db} from "@/lib/db/drizzle";
import {category} from "@/lib/db/schema/questions-schema";
import {eq} from "drizzle-orm";

// ─── PUT — update category ─────────────────────────────────
export async function PUT(
  request: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const session = await auth.api.getSession({headers: request.headers});
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({error: "No autorizado"}, {status: 403});
  }

  const {id} = await params;
  const body = await request.json();
  const {name, description, sortOrder} = body;

  const existing = await db.select().from(category).where(eq(category.id, id)).limit(1);
  if (existing.length === 0) {
    return NextResponse.json({error: "Categoría no encontrada"}, {status: 404});
  }

  await db
    .update(category)
    .set({
      name: name?.trim(),
      description: description?.trim() ?? null,
      sortOrder,
    })
    .where(eq(category.id, id));

  return NextResponse.json({success: true});
}

// ─── DELETE — delete category (cascades to questions) ─────
export async function DELETE(
  request: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const session = await auth.api.getSession({headers: request.headers});
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({error: "No autorizado"}, {status: 403});
  }

  const {id} = await params;

  const existing = await db.select().from(category).where(eq(category.id, id)).limit(1);
  if (existing.length === 0) {
    return NextResponse.json({error: "Categoría no encontrada"}, {status: 404});
  }

  await db.delete(category).where(eq(category.id, id));

  return NextResponse.json({success: true});
}
