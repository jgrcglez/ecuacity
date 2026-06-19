import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { contactMessage } from "@/lib/db/schema/contact-schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const testimonials = await db
    .select()
    .from(contactMessage)
    .where(eq(contactMessage.testimonialPublished, true))
    .orderBy(desc(contactMessage.createdAt))
    .limit(10);

  return NextResponse.json({
    testimonials: testimonials.map((t) => ({
      name: t.name,
      email: t.email,
      message: t.message,
      createdAt: t.createdAt,
    })),
  });
}
