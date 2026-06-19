import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { contactMessage } from "@/lib/db/schema/contact-schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, isTestimonial } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 });
    }

    await db.insert(contactMessage).values({ name, email, subject, message, isTestimonial: isTestimonial ?? false });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al enviar el mensaje" }, { status: 500 });
  }
}
