"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, BookOpen } from "lucide-react";
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
  progress: { selectedOptionId: string; isCorrect: boolean } | null;
}

type ViewState = "loading" | "exam" | "results";

export default function PracticarClient() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const [retakeCount, setRetakeCount] = useState(0);

  const [view, setView] = useState<ViewState>("loading");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [results, setResults] = useState<AnswerResult[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setView("loading");
      try {
        const url = categoryId
          ? `/api/user/questions?categoryId=${categoryId}&page=1`
          : "/api/user/questions";

        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;
        const qs: QuestionData[] = data.questions;

        const allAnswered = qs.every((q) => q.progress !== null);

        setQuestions(qs);
        if (allAnswered && qs.length > 0) {
          setResults(
            qs.filter((q) => q.progress).map((q) => ({
              questionId: q.id,
              selectedOptionId: q.progress!.selectedOptionId,
              isCorrect: q.progress!.isCorrect,
              correctOptionId: "",
            })),
          );
          setView("results");
        } else {
          setView("exam");
        }
      } catch {
        if (!cancelled) setView("exam");
      }
    }

    load();
    return () => { cancelled = true; };
  }, [categoryId, retakeCount]);

  const handleComplete = (r: AnswerResult[]) => {
    setResults(r);
    setView("results");
  };

  const handleRetake = async () => {
    try {
      await fetch("/api/user/progress", { method: "DELETE" });
    } catch {
      // ignore
    }
    setRetakeCount((n) => n + 1);
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Practicar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {categoryId ? questions[0]?.categoryName ?? "Categoría" : "Modo práctica"}
        </p>
      </div>

      {view === "exam" && questions.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">No hay preguntas disponibles</h2>
          <p className="text-sm text-muted-foreground">
            {categoryId ? "Esta categoría no tiene preguntas todavía." : "El banco de preguntas aún no tiene contenido."}
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
