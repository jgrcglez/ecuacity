import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Gracias a Ecuacity aprobé el examen en mi primer intento. Las preguntas son muy similares a las del examen real. ¡Lo recomiendo totalmente!",
    name: "María Fernanda López",
    role: "Guayaquil — Aprobó en marzo 2026",
    rating: 5,
  },
  {
    quote:
      "La sección de historia ecuatoriana era mi debilidad, pero con las explicaciones detalladas de cada respuesta pude aprender y mejorar rápidamente.",
    name: "Carlos Mendoza",
    role: "Cuenca — Aprobó en enero 2026",
    rating: 5,
  },
  {
    quote:
      "Como extranjero, no sabía por dónde empezar. Ecuacity me dio la estructura y confianza que necesitaba. La simulación con tiempo fue clave.",
    name: "James Richardson",
    role: "Quito — Aprobó en abril 2026",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background image — Cuenca */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/landing/cuenca.jpg')] bg-cover bg-center bg-no-repeat bg-fixed"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-flag-blue/95 backdrop-blur-[2px]"
      />

      <div className="relative container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Estudiantes que ya{" "}
            <span className="text-flag-yellow">aprobaron</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Cientos de personas han confiado en Ecuacity para preparar su examen
            de ciudadanía ecuatoriana.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/15 transition-colors"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 text-flag-yellow fill-flag-yellow"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-white/80 text-sm leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-white font-medium text-sm">{t.name}</p>
                <p className="text-white/50 text-xs mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
