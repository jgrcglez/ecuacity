"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BarChart3, CheckCircle2, Target, Trophy, Sparkles, ArrowRight, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  questionText: string | null;
  isCorrect: boolean;
  answeredAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalAnswered: 0, totalCorrect: 0, totalIncorrect: 0 });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/user/me").then((r) => r.json()),
      fetch("/api/user/progress", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/user/activity?limit=10", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([me, progress, act]) => {
      setIsPremium(me.subscription?.isPremium ?? false);
      setStats(progress);
      setActivity(act.activity ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const accuracy = stats.totalAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-6 rounded-full border-2 border-flag-blue border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen de tu progreso en Ecuacity.
          <button onClick={fetchData} className="ml-2 inline-flex items-center text-xs text-flag-blue hover:underline">
            <RefreshCw className="size-3 mr-1" />
            Actualizar
          </button>
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="size-9 rounded-lg bg-flag-blue/10 flex items-center justify-center mb-3">
            <BarChart3 className="size-4 text-flag-blue" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">{stats.totalAnswered}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Preguntas respondidas</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="size-9 rounded-lg bg-green-50 flex items-center justify-center mb-3">
            <CheckCircle2 className="size-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">{stats.totalCorrect}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Respuestas correctas</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="size-9 rounded-lg bg-flag-yellow/20 flex items-center justify-center mb-3">
            <Target className="size-4 text-flag-yellow-dark" />
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">{accuracy}%</div>
          <p className="text-xs text-muted-foreground mt-0.5">Precisión</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="size-9 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
            <Trophy className="size-4 text-purple-600" />
          </div>
          <div className="text-base font-bold text-foreground tracking-tight">
            {isPremium ? "Premium" : "Básico"}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Plan actual</p>
        </div>
      </div>

      {/* Plan card + Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan tier */}
        <div className={`rounded-xl border p-6 flex flex-col ${isPremium ? "border-flag-blue bg-flag-blue/[0.03] ring-1 ring-flag-blue/20" : "border-border bg-card"}`}>
          <div className="flex items-center gap-2 mb-3">
            {isPremium ? <Sparkles className="size-5 text-flag-yellow-dark" /> : <Trophy className="size-5 text-flag-blue" />}
            <h3 className="font-semibold text-foreground">
              Plan {isPremium ? "Premium" : "Básico"}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">
            {isPremium
              ? "Acceso completo a todas las categorías y preguntas ilimitadas. Estudia a tu ritmo con todas las herramientas disponibles."
              : "10 preguntas de práctica asignadas. Mejora a Premium para acceder al banco completo de preguntas y todas las categorías."}
          </p>
          {!isPremium && (
            <Button className="mt-4 bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white transition-all duration-150 font-semibold text-sm" asChild>
              <Link href="/students/upgrade">
                Mejorar a Premium <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          )}
        </div>

        {/* Quick start */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Continuar práctica</h3>
            <p className="text-sm text-muted-foreground">
              {isPremium
                ? "Elige una categoría y empieza a practicar con preguntas de todo el banco."
                : "Responde tus 10 preguntas asignadas y recibe retroalimentación inmediata."}
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white transition-all duration-150 font-semibold" asChild>
              <Link href="/students/practicar">
                Practicar <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
            {isPremium && (
              <Button variant="outline" className="border-border" asChild>
                <Link href="/students/categorias">Categorías</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      {activity.length > 0 && (
        <details className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none select-none">
            <span className="text-sm font-semibold text-foreground">Práctica reciente</span>
            <Clock className="size-4 text-muted-foreground shrink-0" />
          </summary>
          <div className="px-5 pb-4 space-y-2">
            {activity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-border last:border-0">
                <span className={`size-5 rounded-full flex items-center justify-center shrink-0 ${item.isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {item.isCorrect ? <CheckCircle2 className="size-3" /> : <span className="text-[10px] font-bold">✕</span>}
                </span>
                <span className="text-foreground truncate flex-1">{item.questionText ?? "Pregunta eliminada"}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(item.answeredAt).toLocaleDateString("es-EC", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
