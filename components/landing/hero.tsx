import { Star, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CtaLink } from "./cta-link";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-flag-blue">
      {/* Background image — Quito */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/landing/quito.jpg')] bg-cover bg-center bg-no-repeat"
      />
      {/* Gradient overlays for readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-flag-blue/95 via-flag-blue/85 to-flag-blue/95"
      />
      {/* Grid pattern overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating accent shapes */}
      <div
        aria-hidden="true"
        className="absolute top-20 right-[10%] size-64 rounded-full bg-flag-red/20 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-32 left-[5%] size-80 rounded-full bg-flag-yellow/10 blur-[120px]"
      />

      <div className="relative container mx-auto px-4 pt-32 pb-16 text-center">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-8 border border-white/10">
          <Star className="size-3.5 text-flag-yellow fill-flag-yellow" />
          <span className="text-white/90">Simulador de ciudadanía ecuatoriana</span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up animate-delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05] max-w-4xl mx-auto">
          <span className="text-white">Obtén tu </span>
          <span className="text-flag-yellow">ciudadanía ecuatoriana</span>
          <span className="text-white"> con confianza</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up animate-delay-200 text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          El simulador de examen más completo basado en preguntas reales
          del Ministerio de Relaciones Exteriores. Practica con 1,000+ preguntas,
          recibe retroalimentación inmediata y llega preparado el día del examen.
        </p>

        {/* CTAs — tiny client island, rest of hero is server-rendered */}
        <CtaLink />
      </div>
    </section>
  );
}
