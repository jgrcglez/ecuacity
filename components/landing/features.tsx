import { BookOpen, CheckCircle2, Brain, Clock, Trophy, Globe } from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Preguntas reales",
    description:
      "Más de 1,000 preguntas que cubren historia, geografía, cultura, leyes y símbolos patrios del Ecuador.",
    color: "bg-flag-blue/10 text-flag-blue",
  },
  {
    icon: CheckCircle2,
    title: "Resultados inmediatos",
    description:
      "Recibe retroalimentación al instante después de cada respuesta. Aprende de tus aciertos y errores.",
    color: "bg-flag-red/10 text-flag-red",
  },
  {
    icon: Brain,
    title: "Práctica guiada",
    description:
      "Responde una pregunta a la vez en un entorno limpio y enfocado, diseñado para maximizar tu concentración.",
    color: "bg-flag-yellow/20 text-flag-yellow-dark",
  },
  {
    icon: Clock,
    title: "Práctica flexible",
    description:
      "Estudia a tu ritmo. Retoma tus preguntas cuando quieras — siempre tendrás las mismas para seguir mejorando.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Trophy,
    title: "Visualiza tu progreso",
    description:
      "Al finalizar, revisa cada pregunta con tu respuesta. Identifica qué temas necesitas reforzar.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Globe,
    title: "Acceso 24/7",
    description:
      "Practica desde cualquier dispositivo con conexión a internet. Tu progreso se guarda automáticamente.",
    color: "bg-amber-50 text-amber-600",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Todo lo que necesitas para{" "}
            <span className="text-flag-blue">aprobar</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Nuestro simulador está diseñado para replicar exactamente la experiencia
            del examen real, con contenido constantemente actualizado.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Icon */}
                <div
                  className={`size-11 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="size-5" />
                </div>

                <h3 className="font-semibold text-foreground mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Subtle gradient highlight on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-flag-blue/[0.02] to-flag-yellow/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
