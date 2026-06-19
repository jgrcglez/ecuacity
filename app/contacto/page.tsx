"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { Loader2, CheckCircle2, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ContactForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [asTestimonial, setAsTestimonial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = setTimeout(() => {
      if (searchParams.get("compartir") === "true") {
        setAsTestimonial(true);
        setForm((f) => ({ ...f, subject: "Comparto mi experiencia con Ecuacity" }));
      }
    }, 0);
    return () => clearTimeout(id);
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isTestimonial: asTestimonial }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al enviar");
      } else {
        setSuccess(true);
        setForm({ name: "", email: "", subject: "", message: "" });
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-10 max-w-md w-full text-center">
          <div className="size-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="size-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Mensaje enviado</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Gracias por contactarnos. Te responderemos a la brevedad.
          </p>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/50 py-20">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="size-3.5" /> Volver
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Contacto</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Escríbenos y te responderemos lo antes posible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Tu nombre" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="tu@correo.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Asunto</Label>
            <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required placeholder="Motivo del mensaje" />
          </div>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <input type="checkbox" checked={asTestimonial} onChange={(e) => setAsTestimonial(e.target.checked)} className="mt-0.5 size-4 accent-flag-blue" />
            <div>
              <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Star className="size-3.5 text-flag-yellow fill-flag-yellow" /> Quiero compartir mi experiencia como testimonio
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Si aprobaste el examen, tu historia podría aparecer en la página principal para inspirar a otros.
              </p>
            </div>
          </label>

          <div className="space-y-2">
            <Label htmlFor="message">{asTestimonial ? "Tu experiencia" : "Mensaje"}</Label>
            <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required placeholder={asTestimonial ? "Cuéntanos cómo te fue en el examen..." : "Escribe tu mensaje aquí..."} />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-flag-blue text-white hover:bg-flag-blue/90 font-semibold">
            {loading ? <><Loader2 className="size-4 mr-2 animate-spin" />Enviando...</> : "Enviar mensaje"}
          </Button>
        </form>
      </div>
    </main>
  );
}

export default function ContactoPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    }>
      <ContactForm />
    </Suspense>
  );
}
