"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { ExerciseType, Question } from "@/app/types/exercise";
import QuestionRenderer from "@/components/QuestionRenderer";

interface QuickPracticeProps {
  title: string;
  type: ExerciseType;
  questions: Question[];
  onBack: () => void;
}

export default function QuickPractice({ title, type, questions, onBack }: QuickPracticeProps) {
  const t = useTranslations("Practice");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[][]>(() => 
    questions.map((q) => {
      if (type === ExerciseType.FILL_GAP_TEXT) {
        const gapCount = (q.prompt.match(/_+/g) || []).length;
        return new Array(gapCount).fill("");
      }
      return [""];
    })
  );
  const [results, setResults] = useState<(boolean | null)[]>(() => 
    new Array(questions.length).fill(null)
  );
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAnswer = useCallback(async () => {
    if (isSubmitting) return;

    const currentQuestion = questions[currentQuestionIndex];
    const questionAnswers = answers[currentQuestionIndex];

    if (questionAnswers.some(a => !a.trim())) return;

    let fullSentence = "";
    if (type === ExerciseType.FILL_GAP_TEXT) {
      const parts = currentQuestion.prompt.split(/_+/);
      fullSentence = parts.reduce((acc, part, i) => {
        if (i < questionAnswers.length) {
          return acc + part + questionAnswers[i];
        }
        return acc + part;
      }, "");
    } else {
      fullSentence = questionAnswers[0].trim();
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/exercise-sets/validate-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          answer: fullSentence
        }),
      });
      const data = await response.json();
      const isCorrect = data.isCorrect;
      
      const newResults = [...results];
      newResults[currentQuestionIndex] = isCorrect;
      setResults(newResults);
    } catch (error) {
      console.error("Failed to validate answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestionIndex, questions, answers, results, type, isSubmitting]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentQuestionIndex, questions.length]);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isSubmitted = results[currentQuestionIndex] !== null;
  const correctAnswersCount = results.filter((r) => r === true).length;

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isFinished && !isSubmitting) {
        if (!isSubmitted) {
          if (answers[currentQuestionIndex]?.every(a => a.trim())) {
            handleSubmitAnswer();
          }
        } else {
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isFinished, isSubmitted, answers, currentQuestionIndex, handleSubmitAnswer, handleNext, isSubmitting]);

  if (isFinished) {
    return (
      <div className="flex flex-col items-center">
        <button onClick={onBack} className="back-link self-start mb-4">
          <ArrowLeft className="w-4 h-4" />
          {t("backToHome")}
        </button>
        <div className="card p-8 md:p-12 w-full max-w-2xl text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-6">{t("exerciseCompleted")}</h1>
          <div className="bg-slate-50/80 rounded-2xl p-8 mb-8 border border-slate-100">
            <p className="text-5xl font-bold text-slate-900 mb-2">
              {correctAnswersCount} <span className="text-2xl text-slate-400">/ {questions.length}</span>
            </p>
            <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">{t("correct")}</p>
          </div>
          <button onClick={onBack} className="btn-primary w-full">
            {t("finish")}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col items-center">
      <button onClick={onBack} className="back-link self-start mb-4">
        <ArrowLeft className="w-4 h-4" />
        {t("backToHome")}
      </button>
      <div className="card overflow-hidden w-full max-w-3xl">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h1 className="font-bold text-slate-900 truncate max-w-[70%]">{title}</h1>
          <span className="text-sm font-bold text-slate-500 whitespace-nowrap">
            {t("questionProgress", {
              current: currentQuestionIndex + 1,
              total: questions.length,
            })}
          </span>
        </div>

        <div className="p-10">
          <QuestionRenderer
            question={currentQuestion}
            type={type}
            values={answers[currentQuestionIndex] || []}
            onChange={(value, gapIndex = 0) => {
              if (isSubmitted) return;
              const newAnswers = [...answers];
              const questionAnswers = [...(newAnswers[currentQuestionIndex] || [])];
              questionAnswers[gapIndex] = value;
              newAnswers[currentQuestionIndex] = questionAnswers;
              setAnswers(newAnswers);
            }}
            isSubmitted={isSubmitted}
            isCorrect={results[currentQuestionIndex]}
          />
        </div>

        <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center">
          {currentQuestionIndex > 0 ? (
            <button onClick={handlePrevious} className="btn-ghost">
              {t("previous")}
            </button>
          ) : <div />}
          
          <div className="flex gap-4">
            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !answers[currentQuestionIndex]?.every(a => a.trim())}
                className="btn-primary px-8"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : t("submit")}
              </button>
            ) : (
              <button onClick={handleNext} className="btn-primary px-8">
                {currentQuestionIndex === questions.length - 1 ? t("finish") : t("next")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
