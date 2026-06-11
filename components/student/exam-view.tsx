"use client";

import { useState, useCallback } from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "./progress-bar";

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

interface ExamViewProps {
  questions: QuestionData[];
  onComplete: (results: AnswerResult[]) => void;
}

export interface AnswerResult {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionId: string;
}

const LABELS = ["A", "B", "C", "D", "E"];

export default function ExamView({ questions, onComplete }: ExamViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, AnswerResult>>(new Map());
  const [submitting, setSubmitting] = useState(false);

  const q = questions[currentIndex];
  const result = answers.get(q.id);
  const hasAnswered = result !== undefined;

  const submitAnswer = useCallback(
    async (optionId: string) => {
      if (hasAnswered || submitting) return;
      setSubmitting(true);

      try {
        const res = await fetch("/api/user/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: q.id, selectedOptionId: optionId }),
        });

        if (!res.ok) throw new Error();
        const data = await res.json();

        const entry: AnswerResult = {
          questionId: q.id,
          selectedOptionId: optionId,
          isCorrect: data.isCorrect,
          correctOptionId: data.correctOptionId,
        };

        setAnswers((prev) => new Map(prev).set(q.id, entry));
      } catch {
        // silently fail — user can retry
      } finally {
        setSubmitting(false);
      }
    },
    [q.id, hasAnswered, submitting],
  );

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Last question — finish
      const results: AnswerResult[] = [];
      for (const q of questions) {
        const a = answers.get(q.id);
        if (a) results.push(a);
      }
      onComplete(results);
    }
  };

  const correctOptionId = result?.correctOptionId ?? null;

  // Determine option styling
  const getOptionClass = (option: Option) => {
    if (!result) {
      // Not answered yet
      return "border-border bg-card hover:border-flag-blue hover:bg-flag-blue/[0.02] cursor-pointer";
    }

    const isSelected = result.selectedOptionId === option.id;
    const isCorrectAnswer = option.id === correctOptionId;

    if (isSelected && result.isCorrect) {
      // User picked the right one
      return "border-green-400 bg-green-50 ring-1 ring-green-400/30";
    }
    if (isSelected && !result.isCorrect) {
      // User picked the wrong one
      return "border-red-400 bg-red-50 ring-1 ring-red-400/30";
    }
    if (isCorrectAnswer && !result.isCorrect) {
      // Show the actual correct answer in green
      return "border-green-400 bg-green-50/50 ring-1 ring-green-400/20";
    }
    // Other options — dimmed
    return "border-border bg-card opacity-40";
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Progress */}
      <ProgressBar current={currentIndex + 1} total={questions.length} />

      {/* Category tag */}
      {q.categoryName && (
        <span className="inline-block text-[11px] font-semibold text-flag-blue uppercase tracking-wider bg-flag-blue/5 rounded-full px-3 py-1">
          {q.categoryName}
        </span>
      )}

      {/* Question text */}
      <h2 className="text-xl font-bold text-foreground leading-snug">
        {q.text}
      </h2>

      {/* Question image */}
      {q.imageUrl && (
        <img
          src={q.imageUrl}
          alt="Imagen de la pregunta"
          className="w-full max-h-64 object-cover rounded-xl border border-border"
        />
      )}

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((opt, i) => {
          const isSelected = result?.selectedOptionId === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => submitAnswer(opt.id)}
              disabled={hasAnswered || submitting}
              type="button"
              className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${getOptionClass(opt)}`}
            >
              {/* Label */}
              <span
                className={`size-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isSelected
                    ? result?.isCorrect
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isSelected ? (
                  result?.isCorrect ? (
                    <Check className="size-4" />
                  ) : (
                    <X className="size-4" />
                  )
                ) : (
                  LABELS[i]
                )}
              </span>

              {/* Text */}
              <span className="text-sm font-medium text-foreground flex-1">
                {opt.text}
              </span>

              {/* Feedback after answering */}
              {hasAnswered && isSelected && (
                <span
                  className={`text-xs font-semibold ${
                    result!.isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result!.isCorrect ? "¡Correcto!" : "Incorrecto"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Next / Finish button */}
      {hasAnswered && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={goNext}
            className="bg-flag-blue text-white hover:bg-flag-blue/90 font-semibold"
          >
            {currentIndex < questions.length - 1 ? (
              <>
                Siguiente
                <ArrowRight className="size-4 ml-2" />
              </>
            ) : (
              "Ver resultados"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
