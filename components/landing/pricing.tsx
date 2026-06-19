import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Básico",
    price: "Gratis",
    period: "para siempre",
    description: "Perfecto para empezar a practicar.",
    features: [
      "10 preguntas de práctica asignadas",
      "Resultados inmediatos al responder",
      "Reintentos ilimitados",
      "Acceso 24/7",
    ],
    cta: "Comenzar gratis",
    href: "/sign-up",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/ 30 días",
    description: "Acceso completo al banco de preguntas.",
    features: [
      "1,049 preguntas actualizadas",
      "Todas las categorías disponibles",
      "Práctica ilimitada",
      "Repasar preguntas falladas",
      "Estadísticas detalladas",
      "Pago único — no se renueva",
    ],
    cta: "Comprar Premium",
    href: "/students/upgrade",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Planes <span className="text-flag-blue">simples</span> y transparentes
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Empieza gratis hoy. Sin compromisos ni cargos ocultos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col",
                plan.highlighted
                  ? "border-flag-blue bg-flag-blue/3 shadow-xl shadow-flag-blue/10 ring-1 ring-flag-blue/20"
                  : "border-flag-yellow/30 bg-flag-yellow/3 shadow-xl shadow-flag-yellow/10 ring-1 ring-flag-yellow/20",
              )}
            >
              {plan.name === "Premium" && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <span className="inline-flex items-center gap-1 bg-flag-yellow text-flag-blue text-xs font-semibold px-3 py-1 rounded-full">
                    Más popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground mb-1 tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground tracking-tight">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="size-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full font-semibold",
                  plan.highlighted
                    ? "bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white"
                    : "bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white",
                )}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
