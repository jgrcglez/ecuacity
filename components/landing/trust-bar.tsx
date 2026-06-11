"use client";

import { useState, useEffect } from "react";

interface PublicStats {
  totalQuestions: number;
  totalCategories: number;
  totalUsers: number;
  totalAnswered: number;
}

export default function TrustBar() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    fetch("/api/public/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const fmt = (n: number | undefined | null) =>
    n != null ? n.toLocaleString("es-EC") : "—";

  const items = [
    { value: fmt(stats?.totalQuestions), label: "Preguntas activas" },
    { value: fmt(stats?.totalCategories), label: "Categorías" },
    { value: fmt(stats?.totalUsers), label: "Estudiantes" },
    { value: fmt(stats?.totalAnswered), label: "Respuestas registradas" },
  ];

  return (
    <section className="bg-flag-blue border-y-4 border-flag-yellow py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-20 text-center">
          {items.map((item) => (
            <div key={item.label} className="group">
              <div className="text-3xl md:text-4xl font-bold tracking-tight text-flag-yellow mb-1 group-hover:scale-105 transition-transform">
                {item.value}
              </div>
              <div className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
