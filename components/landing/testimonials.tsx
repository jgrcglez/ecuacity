"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PublishedTestimonial {
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<PublishedTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/published-testimonials")
      .then((r) => r.json())
      .then((d) => setTestimonials(d.testimonials ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/landing/cuenca.jpg')] bg-cover bg-center bg-no-repeat bg-fixed"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-flag-blue/95 backdrop-blur-[2px]"
      />

      <div className="relative container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Estudiantes que ya{" "}
            <span className="text-flag-yellow">aprobaron</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Miles de personas buscan prepararse para el examen de ciudadanía
            ecuatoriana cada año. Ecuacity está aquí para ayudarte.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 text-white/40 animate-spin" />
          </div>
        ) : (
          <>
            {testimonials.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
                {testimonials.map((t) => (
                  <div
                    key={t.email + t.createdAt}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-4 text-flag-yellow fill-flag-yellow" />
                      ))}
                    </div>
                    <blockquote className="text-white/80 text-sm leading-relaxed mb-5">
                      &ldquo;{t.message}&rdquo;
                    </blockquote>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-white font-medium text-sm">{t.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA card — always visible */}
            {testimonials.length > 0 && (
              <div className="relative flex items-center justify-center mb-12">
                <div className="flex-1 h-px bg-white/10" />
                <span className="px-4 text-xs font-medium text-white/30 uppercase tracking-wider">Comparte la tuya</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            )}
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:bg-white/15 transition-colors">
                <div className="size-14 rounded-2xl bg-flag-yellow/20 flex items-center justify-center mx-auto mb-5">
                  <MessageSquare className="size-6 text-flag-yellow" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  ¿Ya aprobaste el examen?
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Comparte tu experiencia y ayuda a otros a prepararse.
                  Tu testimonio puede marcar la diferencia.
                </p>
                <Button className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-semibold" asChild>
                  <Link href="/contacto">Compartir mi experiencia</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
