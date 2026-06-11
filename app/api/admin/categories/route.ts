import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth/auth";
import {db} from "@/lib/db/drizzle";
import {category} from "@/lib/db/schema/questions-schema";
import {asc} from "drizzle-orm";

// ─── GET — all categories ─────────────────────────────────
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({headers: request.headers});
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({error: "No autorizado"}, {status: 403});
  }

  const rows = await db
    .select()
    .from(category)
    .orderBy(asc(category.sortOrder));

  return NextResponse.json({categories: rows});
}

// ─── POST — create category ────────────────────────────────
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({headers: request.headers});
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({error: "No autorizado"}, {status: 403});
  }

  const body = await request.json();
  const {name, description, sortOrder} = body;

  if (!name?.trim()) {
    return NextResponse.json({error: "El nombre es requerido"}, {status: 400});
  }

  const [created] = await db
    .insert(category)
    .values({
      name: name.trim(),
      description: description?.trim() || null,
      sortOrder: sortOrder ?? 0,
    })
    .returning();

  return NextResponse.json({category: created}, {status: 201});
}
