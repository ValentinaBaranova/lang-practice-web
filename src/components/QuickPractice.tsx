"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
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
      <div className="page-content-centered">
        <button onClick={onBack} className="back-link justify-center">
          <ArrowLeft className="w-4 h-4" />
          {t("backToHome")}
        </button>
        <div className="card p-5 md:p-12">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10">
              <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">{t("exerciseCompleted")}</h1>
          
          <div className="bg-slate-50/80 rounded-2xl p-4 md:p-8 mb-4 md:mb-8 border border-slate-100">
            <p className="text-4xl md:text-5xl font-bold text-slate-900 mb-1 md:mb-2">
              {correctAnswersCount} <span className="text-xl md:text-2xl text-slate-400">/ {questions.length}</span>
            </p>
            <p className="text-slate-500 font-bold uppercase tracking-wider text-xs md:text-sm">{t("correct")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="page-content-narrow">
      <button onClick={onBack} className="back-link">
        <ArrowLeft className="w-4 h-4" />
        {t("backToHome")}
      </button>
      <div className="card overflow-hidden">
        <div className="px-3 py-3 md:px-6 md:py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h1 className="font-bold text-slate-900 line-clamp-2 md:truncate max-w-[80%] md:max-w-[70%]">{title}</h1>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xs md:text-sm font-bold text-slate-500 whitespace-nowrap">
              {t("questionProgress", {
                current: currentQuestionIndex + 1,
                total: questions.length,
              })}
            </span>
          </div>
        </div>

        <div className="p-3 md:p-10">
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

        <div className="px-3 py-2.5 md:px-8 md:py-6 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center">
          {currentQuestionIndex > 0 ? (
            <button onClick={handlePrevious} className="btn-ghost">
              {t("previous")}
            </button>
          ) : <div />}
          
          <div className="flex gap-2 md:gap-4">
            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !answers[currentQuestionIndex]?.every(a => a.trim())}
                className="btn-primary px-4 md:px-8"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : t("submit")}
              </button>
            ) : (
              <button onClick={handleNext} className="btn-primary px-4 md:px-8">
                {currentQuestionIndex === questions.length - 1 ? t("finish") : t("next")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
