"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, X, ArrowRight, Sparkles, Loader2, ExternalLink, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  const [isPremium, setIsPremium] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Read URL params after redirect from Payphone
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setSuccess(true);
      // Clean URL
      window.history.replaceState({}, "", "/students/upgrade");
    }
    if (params.get("error")) {
      setError(
        params.get("error") === "canceled"
          ? "El pago fue cancelado"
          : params.get("error") === "missing_params"
            ? "Error al procesar el pago"
            : "Ocurrió un error al procesar el pago"
      );
      window.history.replaceState({}, "", "/students/upgrade");
    }
  }, []);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        setIsPremium(d.subscription?.isPremium ?? false);
        setExpiresAt(d.subscription?.expiresAt ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleBuy() {
    setPaying(true);
    setError("");

    try {
      const res = await fetch("/api/payphone/prepare", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        // Redirect user to Payphone's payment page
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Error al iniciar pago");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <div className="size-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
          <Check className="size-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">¡Bienvenido a Premium!</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Tu acceso premium está activo. Ahora tienes el banco completo de preguntas y todas las categorías disponibles.
        </p>
        <Button className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-semibold" asChild>
          <Link href="/students/categorias">
            Explorar categorías <ArrowRight className="size-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    );
  }

  if (isPremium) {
    const expiryDate = expiresAt ? new Date(expiresAt).toLocaleDateString("es-EC") : null;
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <div className="size-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
          <Check className="size-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Ya eres Premium</h1>
        <p className="text-muted-foreground">
          Tienes acceso completo a todas las categorías y preguntas del banco.
        </p>
        {expiryDate && (
          <p className="text-sm text-muted-foreground">
            Tu acceso vence el <span className="font-semibold text-foreground">{expiryDate}</span>
          </p>
        )}
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

      {/* Price card */}
      <div className="max-w-sm mx-auto">
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
          <p className="text-4xl font-bold text-foreground">
            $9.99
            <span className="text-sm font-normal text-muted-foreground"> / 30 días</span>
          </p>
          <ul className="text-left space-y-2 text-sm">
            {[
              "Banco completo de preguntas",
              "Todas las categorías disponibles",
              "Práctica ilimitada",
              "Estadísticas detalladas",
              "Soporte prioritario",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="size-3.5 text-green-500 shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={handleBuy}
            disabled={paying}
            className="w-full bg-flag-blue text-white hover:bg-flag-blue/90 font-semibold h-11"
          >
            {paying ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Redirigiendo a pago...
              </>
            ) : (
              <>
                <CreditCard className="size-4 mr-2" />
                Comprar acceso Premium
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Pago procesado por <strong>Payphone</strong>. Aceptamos Visa, Mastercard, Diners y Payphone wallet.
            <br />
            <ExternalLink className="size-3 inline mr-0.5" />
            Pago único — acceso por 30 días. No se renueva automáticamente.
          </p>
        </div>
      </div>

      {/* Comparison table */}
      <div className="grid grid-cols-2 gap-0 rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/50 px-5 py-3 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actual</span>
          <p className="text-lg font-bold text-foreground mt-0.5">Básico</p>
        </div>
        <div className="bg-flag-blue/[0.03] px-5 py-3 border-b border-l border-border text-right">
          <span className="text-xs font-semibold text-flag-blue uppercase tracking-wider">Premium</span>
          <p className="text-lg font-bold text-foreground mt-0.5">$9.99 / 30d</p>
        </div>

        {[
          { label: "Preguntas de práctica", free: "10 asignadas", premium: "Ilimitadas" },
          { label: "Categorías", free: "No disponibles", premium: "Todas" },
          { label: "Práctica por categoría", free: false, premium: true },
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
                ) : row.free}
              </span>
              <span className="text-sm font-medium text-foreground">
                {typeof row.premium === "boolean" ? (
                  row.premium ? <Check className="size-4 text-green-500" /> : <X className="size-4 text-red-400" />
                ) : row.premium}
              </span>
            </div>
          </div>
        ))}

        <div className="px-5 py-4 border-b border-border flex items-end">
          <span className="text-xs text-muted-foreground">Gratis para siempre</span>
        </div>
        <div className="px-5 py-4 border-b border-l border-border flex items-end justify-end">
          <Button size="sm" onClick={handleBuy} disabled={paying} className="bg-flag-blue text-white hover:bg-flag-blue/90 font-semibold text-xs h-8 px-4">
            {paying ? "..." : "Comprar"}
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        ¿Preguntas?{" "}
        <a href="mailto:soporte@ecuacity.com" className="text-flag-blue underline">
          soporte@ecuacity.com
        </a>
      </p>
    </div>
  );
}
