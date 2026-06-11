import { UserPlus, BookOpenCheck, PartyPopper } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: UserPlus,
    title: "Regístrate gratis",
    desc: "Crea tu cuenta en menos de 1 minuto y recibe 10 preguntas de práctica.",
  },
  {
    num: "02",
    icon: BookOpenCheck,
    title: "Practica a tu ritmo",
    desc: "Responde una pregunta a la vez con retroalimentación inmediata en cada respuesta.",
  },
  {
    num: "03",
    icon: PartyPopper,
    title: "Revisa y mejora",
    desc: "Al terminar, revisa tus resultados, identifica tus áreas débiles y vuelve a intentarlo.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Cómo <span className="text-flag-blue">funciona</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Tres pasos sencillos para empezar a prepararte para el examen de naturalización.
          </p>
        </div>

        {/* Timeline steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative text-center group">
                {/* Connector line (desktop) */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-border"
                    aria-hidden="true"
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2 rounded-full bg-flag-blue" />
                  </div>
                )}

                {/* Number */}
                <div className="text-xs font-bold text-flag-blue/30 tracking-widest mb-3">
                  {step.num}
                </div>

                {/* Icon circle */}
                <div className="size-16 rounded-2xl bg-flag-blue text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-flag-blue/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon className="size-6" />
                </div>

                <h3 className="font-semibold text-foreground mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
