import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function FooterCta() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background with Cotopaxi image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/landing/cotopaxi.jpg')] bg-cover bg-center bg-no-repeat"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-flag-blue/95 via-flag-blue/90 to-flag-red/90"
      />

      {/* Decorative elements */}
      <div
        aria-hidden="true"
        className="absolute top-10 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-flag-yellow/10 blur-[150px]"
      />

      <div className="relative container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 max-w-2xl mx-auto leading-[1.1]">
          ¿Listo para obtener tu{" "}
          <span className="text-flag-yellow">ciudadanía</span>?
        </h2>
        <p className="text-white/70 text-base max-w-xl mx-auto mb-10 leading-relaxed">
          Comienza hoy mismo a prepararte para el examen de naturalización ecuatoriana.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-flag-yellow text-flag-blue font-bold text-base px-10 h-12 shadow-xl shadow-flag-yellow/25 hover:bg-flag-blue hover:text-white transition-all duration-150"
            asChild
          >
            <Link href="/sign-up">
              Crear cuenta gratis
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
