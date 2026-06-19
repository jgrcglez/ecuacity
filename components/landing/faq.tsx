import { HelpCircle, ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "¿Qué incluye el examen de ciudadanía ecuatoriana?",
    answer:
      "El examen oficial cubre historia, geografía, civismo, cultura, economía y derechos constitucionales del Ecuador. Nuestro simulador incluye preguntas de todas estas categorías, recopiladas de experiencias reales de examinados.",
  },
  {
    question: "¿Las preguntas son iguales a las del examen real?",
    answer:
      "Nuestras preguntas cubren los mismos temas y nivel de dificultad del examen oficial, recopiladas de experiencias reales de examinados y fuentes de estudio autorizadas. No son réplicas exactas del examen, sino material de preparación diseñado para ayudarte a practicar.",
  },
  {
    question: "¿Puedo usar Ecuacity en mi celular?",
    answer:
      "Sí. Ecuacity funciona perfectamente en cualquier dispositivo con navegador web: computadora, tablet o teléfono. La interfaz se adapta automáticamente al tamaño de tu pantalla para que puedas estudiar donde sea.",
  },
  {
    question: "¿Cómo funciona el plan Premium?",
    answer:
      "El plan Premium te da acceso ilimitado a las 1,049 preguntas, todas las categorías disponibles, práctica ilimitada, repaso de preguntas falladas y estadísticas detalladas de tu progreso. Es un pago único de $9.99 por 30 días sin renovación automática.",
  },
  {
    question: "¿Cuánto tiempo necesito para prepararme?",
    answer:
      "Depende de tu nivel de conocimiento previo. La mayoría de nuestros estudiantes se preparan en 2 a 4 semanas practicando 30-45 minutos al día. Nuestro sistema de seguimiento te ayuda a identificar cuándo estás listo.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="size-12 rounded-2xl bg-flag-blue/10 flex items-center justify-center mx-auto mb-5">
            <HelpCircle className="size-6 text-flag-blue" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Preguntas <span className="text-flag-blue">frecuentes</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Todo lo que necesitas saber sobre Ecuacity y el examen de ciudadanía.
          </p>
        </div>

        {/* FAQ accordion using details/summary */}
        <div className="max-w-2xl mx-auto space-y-3">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className="group bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none">
                <span className="text-sm font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown className="size-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5 -mt-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
