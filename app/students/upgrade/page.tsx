"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, X, ArrowRight, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => setIsPremium(d.subscription?.plan === "premium"))
      .catch(() => {});
  }, []);

  if (isPremium) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <div className="size-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
          <Check className="size-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Ya eres Premium</h1>
        <p className="text-muted-foreground">
          Tienes acceso completo a todas las categorías y preguntas del banco.
        </p>
        <Button className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-semibold" asChild>
          <Link href="/students/categorias">
            Explorar categorías <ArrowRight className="size-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="size-14 rounded-2xl bg-flag-yellow/20 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="size-7 text-flag-yellow-dark" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mejora a <span className="text-flag-blue">Premium</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Desbloquea el banco completo de preguntas, todas las categorías y práctica ilimitada.
        </p>
      </div>

      {/* Comparison table */}
      <div className="grid grid-cols-2 gap-0 rounded-xl border border-border overflow-hidden">
        {/* Header row */}
        <div className="bg-muted/50 px-5 py-3 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan actual</span>
          <p className="text-lg font-bold text-foreground mt-0.5">Básico</p>
        </div>
        <div className="bg-flag-blue/[0.03] px-5 py-3 border-b border-l border-border text-right">
          <span className="text-xs font-semibold text-flag-blue uppercase tracking-wider">Recomendado</span>
          <p className="text-lg font-bold text-foreground mt-0.5">Premium</p>
        </div>

        {/* Feature rows */}
        {[
          { label: "Preguntas de práctica", free: "10 asignadas", premium: "Ilimitadas" },
          { label: "Categorías", free: "No disponibles", premium: "Todas las categorías" },
          { label: "Práctica por categoría", free: false, premium: true },
          { label: "Reintentos", free: "Ilimitados", premium: "Ilimitados" },
          { label: "Estadísticas detalladas", free: false, premium: true },
          { label: "Soporte prioritario", free: false, premium: true },
        ].map((row) => (
          <div key={row.label} className="contents">
            <div className="px-5 py-3 border-b border-border text-sm text-foreground font-medium">
              {row.label}
            </div>
            <div className="px-5 py-3 border-b border-l border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {typeof row.free === "boolean" ? (
                  row.free ? <Check className="size-4 text-green-500" /> : <X className="size-4 text-red-400" />
                ) : (
                  row.free
                )}
              </span>
              <span className="text-sm font-medium text-foreground">
                {typeof row.premium === "boolean" ? (
                  row.premium ? <Check className="size-4 text-green-500" /> : <X className="size-4 text-red-400" />
                ) : (
                  row.premium
                )}
              </span>
            </div>
          </div>
        ))}

        {/* CTA row */}
        <div className="px-5 py-4 border-b border-border flex items-end">
          <span className="text-xs text-muted-foreground">Gratis para siempre</span>
        </div>
        <div className="px-5 py-4 border-b border-l border-border flex items-end justify-end">
          <span className="text-xs text-muted-foreground">Próximamente $9.99/mes</span>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <Button
          disabled
          className="bg-flag-blue text-white font-semibold px-10 opacity-70 cursor-not-allowed"
        >
          <Clock className="size-4 mr-2" />
          Mejorar a Premium — Próximamente
        </Button>
        <p className="text-xs text-muted-foreground">
          El sistema de pagos estará disponible pronto. Mientras tanto, disfruta del plan Básico gratuito.
        </p>
        <p className="text-xs text-muted-foreground">
          ¿Preguntas?{" "}
          <a href="mailto:soporte@ecuacity.com" className="text-flag-blue underline">
            soporte@ecuacity.com
          </a>
        </p>
      </div>
    </div>
  );
}
