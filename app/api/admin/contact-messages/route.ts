import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { contactMessage } from "@/lib/db/schema/contact-schema";
import { eq, desc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const filter = searchParams.get("filter"); // "all", "unread", "read"
  const limit = 20;
  const offset = (page - 1) * limit;

  const where = filter === "read"
    ? eq(contactMessage.read, true)
    : filter === "unread"
      ? eq(contactMessage.read, false)
      : undefined;

  const [countRow] = await db
    .select({ total: count() })
    .from(contactMessage)
    .where(where);

  const total = Number(countRow?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const messages = await db
    .select()
    .from(contactMessage)
    .where(where)
    .orderBy(desc(contactMessage.createdAt))
    .limit(limit)
    .offset(offset);

  const [unreadRow] = await db
    .select({ count: count() })
    .from(contactMessage)
    .where(eq(contactMessage.read, false));

  return NextResponse.json({
    messages,
    page,
    totalPages,
    total,
    unread: Number(unreadRow?.count ?? 0),
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, read, testimonialPublished } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (read !== undefined) update.read = read;
  if (testimonialPublished !== undefined) update.testimonialPublished = testimonialPublished;

  await db.update(contactMessage).set(update).where(eq(contactMessage.id, id));
  return NextResponse.json({ success: true });
}
