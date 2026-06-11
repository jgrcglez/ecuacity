"use client";

import { useState } from "react";
import { Check, X, RotateCcw, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnswerResult } from "./exam-view";

interface QuestionData {
  id: string;
  text: string;
  categoryName: string;
  options: { id: string; text: string; order: number }[];
}

interface ResultsViewProps {
  questions: QuestionData[];
  answers: AnswerResult[];
  onRetake: () => void;
}

const LABELS = ["A", "B", "C", "D", "E"];

export default function ResultsView({ questions, answers, onRetake }: ResultsViewProps) {
  const [resetting, setResetting] = useState(false);

  const answerMap = new Map(answers.map((a) => [a.questionId, a]));
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const total = questions.length;
  const pct = Math.round((correctCount / total) * 100);

  const handleRetake = async () => {
    setResetting(true);
    try {
      await fetch("/api/user/progress", { method: "DELETE" });
      onRetake();
    } catch {
      setResetting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Score hero */}
      <div className="text-center space-y-4">
        <div className="size-20 rounded-full bg-flag-blue/10 flex items-center justify-center mx-auto">
          {pct >= 70 ? (
            <Trophy className="size-9 text-flag-yellow-dark" />
          ) : (
            <Target className="size-9 text-flag-blue" />
          )}
        </div>

        <div>
          <div className="text-4xl font-bold text-foreground tracking-tight">
            {correctCount}/{total}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {pct >= 80
              ? "¡Excelente trabajo! Estás muy cerca de dominar el examen."
              : pct >= 60
                ? "¡Buen intento! Sigue practicando para mejorar tu puntuación."
                : "Sigue practicando. Cada intento te acerca más al objetivo."}
          </p>
        </div>

        <div className="w-32 h-2 bg-muted rounded-full mx-auto overflow-hidden">
          <div
            className="h-full bg-flag-blue rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Per-question review */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Revisión de respuestas
        </h3>

        {questions.map((q, i) => {
          const result = answerMap.get(q.id);
          const userOption = q.options.find((o) => o.id === result?.selectedOptionId);
          const correctOption = q.options.find((o) => o.id === result?.correctOptionId);

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-4 ${
                result?.isCorrect
                  ? "border-green-200 bg-green-50/50"
                  : "border-red-200 bg-red-50/50"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Correct/incorrect icon */}
                <span
                  className={`size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    result?.isCorrect
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {result?.isCorrect ? (
                    <Check className="size-3.5" />
                  ) : (
                    <X className="size-3.5" />
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {i + 1}. {q.text}
                  </p>

                  {userOption && (
                    <p
                      className={`text-xs mt-1 ${
                        result?.isCorrect ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      Tu respuesta: <strong>{userOption.text}</strong>
                    </p>
                  )}
                  {!result?.isCorrect && correctOption && (
                    <p className="text-xs mt-0.5 text-green-700">
                      Correcta: <strong>{correctOption.text}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Retake button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleRetake}
          disabled={resetting}
          className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-semibold"
        >
          {resetting ? (
            "Reiniciando..."
          ) : (
            <>
              <RotateCcw className="size-4 mr-2" />
              Volver a intentar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
