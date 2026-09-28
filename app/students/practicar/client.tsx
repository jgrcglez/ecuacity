"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, BookOpen, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExamView, { type AnswerResult } from "@/components/student/exam-view";
import ResultsView from "@/components/student/results-view";

interface Option {
  id: string;
  text: string;
  order: number;
}

interface QuestionData {
  id: string;
  text: string;
  categoryName: string;
  imageUrl: string | null;
  options: Option[];
}

type ViewState = "loading" | "exam" | "results";

export default function PracticarClient() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const mode = searchParams.get("mode");
  const isFailedMode = mode === "failed";

  // Review mode is scoped: switching category drops back to practice
  // mode automatically instead of re-serving an untouched scope.
  const scopeKey = categoryId ?? "__all__";
  const [reviewFor, setReviewFor] = useState<string | null>(null);
  const reviewMode = reviewFor === scopeKey;

  const [retryKey, setRetryKey] = useState(0);
  const [view, setView] = useState<ViewState>("loading");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setView("loading");
      try {
        const params = new URLSearchParams();
        if (categoryId) params.set("categoryId", categoryId);
        if (reviewMode) params.set("mode", "review");
        const query = params.toString();

        const url = isFailedMode
          ? "/api/user/failed-questions"
          : `/api/user/questions${query ? `?${query}` : ""}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;

        setQuestions(data.questions);
        // `remaining === 0` on a non-empty scope means the user has
        // answered everything selectable. Show that explicitly rather
        // than rendering an exam with nothing in it.
        setExhausted(!isFailedMode && data.remaining === 0 && data.total > 0);
        setView("exam");
      } catch {
        if (cancelled) return;
        setQuestions([]);
        setExhausted(false);
        setView("exam");
      }
    }

    load();
    return () => { cancelled = true; };
  }, [categoryId, isFailedMode, retryKey, reviewMode]);

  const handleComplete = (r: AnswerResult[]) => {
    setResults(r);
    setView("results");
  };

  // Progress stats are permanent (the DELETE endpoint is disabled), so
  // retrying just draws a fresh set of questions.
  const handleRetake = () => {
    setResults([]);
    setRetryKey((n) => n + 1);
  };

  if (view === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 text-flag-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isFailedMode ? "Repasar errores" : "Practicar"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isFailedMode
            ? `${questions.length} preguntas respondidas incorrectamente`
            : categoryId
              ? questions[0]?.categoryName ?? "Categoría"
              : "Modo práctica"}
        </p>
      </div>

      {view === "exam" && exhausted ? (
        <div className="text-center py-20">
          <div className="size-14 rounded-full bg-flag-yellow/15 flex items-center justify-center mx-auto mb-4">
            <Trophy className="size-7 text-flag-yellow-dark" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            {categoryId ? "¡Completaste esta categoría!" : "¡Completaste todo el banco!"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Ya respondiste todas las preguntas disponibles aquí.
            <br />
            Puedes repasarlas de nuevo cuando quieras.
          </p>
          <Button
            onClick={() => setReviewFor(scopeKey)}
            className="bg-flag-blue text-white hover:bg-flag-blue/90 font-semibold"
          >
            <RotateCcw className="size-4 mr-2" />
            Repasar todas
          </Button>
        </div>
      ) : view === "exam" && questions.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">
            {isFailedMode ? "No hay errores pendientes" : "No hay preguntas disponibles"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isFailedMode
              ? "Todas tus respuestas han sido correctas. ¡Sigue así!"
              : categoryId
                ? "Esta categoría no tiene preguntas todavía."
                : "El banco de preguntas aún no tiene contenido."}
          </p>
        </div>
      ) : view === "exam" ? (
        <ExamView questions={questions} onComplete={handleComplete} />
      ) : (
        <ResultsView questions={questions} answers={results} onRetake={handleRetake} />
      )}
    </div>
  );
}
