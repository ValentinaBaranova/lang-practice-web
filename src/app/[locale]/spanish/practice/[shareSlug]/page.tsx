"use client";

import {use, useState, useEffect, useCallback} from "react";
import { Link } from "@/routing";
import { useTranslations } from "next-intl";
import { ExerciseType, Question } from "@/app/types/exercise";
import { ExerciseSetResponse, AttemptQuestionResponse } from "@/app/types/api";
import { ArrowLeft } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import QuestionRenderer from "@/components/QuestionRenderer";

export default function PracticePage({
  params,
}: {
  params: Promise<{ shareSlug: string; locale: string }>;
}) {
  const { shareSlug } = use(params);
  const t = useTranslations("Practice");
  const tEdit = useTranslations("EditExercise");

  // Read once from localStorage on mount to know if we had a prefilled name
  const initialStoredName = (typeof window !== "undefined" ? (localStorage.getItem("studentName") || "") : "");
  const [studentName, setStudentName] = useState(initialStoredName);
  // Track if the current session started with a stored name to avoid switching to the spinner while typing
  const [hadStoredNameOnLoad] = useState(!!initialStoredName.trim());
  const [isStarted, setIsStarted] = useState(false);
  const [exercise, setExercise] = useState<ExerciseSetResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[][]>([]);
  const [results, setResults] = useState<(AttemptQuestionResponse | null)[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const correctAnswersCount = results.filter((r) => r?.answers?.every(a => a.isCorrect)).length;

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetchWithAuth(`/api/exercise-sets/share/${shareSlug}`);
        if (!response.ok) {
          throw new Error(tEdit("failedToLoad"));
        }
        const data = await response.json();
        setExercise(data);
        
        // Initialize answers as an array of arrays, one per question
        const initialAnswers = data.questions.map((q: Question) => {
          if (data.type === ExerciseType.FILL_GAP_TEXT) {
            const gapCount = q.gaps?.length ?? (q.prompt.match(/_+/g) || []).length;
            return new Array(gapCount).fill("");
          }
          return [""];
        });
        setAnswers(initialAnswers);
        setResults(new Array(data.questions.length).fill(null));
      } catch (err) {
        setError(err instanceof Error ? err.message : tEdit("somethingWentWrong"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [shareSlug, tEdit]);

  const handleStart = async (e?: React.FormEvent, nameOverride?: string) => {
    e?.preventDefault();
    const nameToUse = nameOverride || studentName;
    if (!nameToUse.trim() || !exercise) return;

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseSetId: exercise.id,
          studentName: nameToUse.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(tEdit("somethingWentWrong"));
      }

      const data = await response.json();
      localStorage.setItem("studentName", nameToUse.trim());
      // Notify same-tab listeners (e.g., MenuBar) because 'storage' does not fire in the same document
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("studentNameUpdated"));
        }
      } catch {}
      setAttemptId(data.id);
      setIsStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : tEdit("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Auto-start only if we had a stored name on initial load
    if (
      exercise &&
      hadStoredNameOnLoad &&
      studentName &&
      !isStarted &&
      !isLoading &&
      !isSubmitting &&
      !error
    ) {
      const timer = setTimeout(() => {
        handleStart(undefined, studentName);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise, isLoading]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!attemptId || !exercise || !exercise.questions || isSubmitting) return;

    const currentQuestion = exercise.questions[currentQuestionIndex];
    const questionAnswers = answers[currentQuestionIndex];

    if (questionAnswers.some(a => !a.trim())) return;

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`/api/attempts/${attemptId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answers: questionAnswers.map((val, index) => ({ index, answer: val.trim() }))
        }),
      });

      if (!response.ok) {
        throw new Error(tEdit("somethingWentWrong"));
      }

      const data = await response.json();
      const newResults = [...results];
      newResults[currentQuestionIndex] = data;
      setResults(newResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : tEdit("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  }, [attemptId, exercise, isSubmitting, currentQuestionIndex, answers, results, tEdit]);

  const handleNext = useCallback(() => {
    if (exercise && exercise.questions && currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  }, [exercise, currentQuestionIndex]);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = exercise?.questions?.[currentQuestionIndex];
  const isSubmitted = results[currentQuestionIndex] !== null;

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isStarted && !isFinished && !isSubmitting) {
        // If not submitted, and all inputs filled, submit
        if (!isSubmitted) {
          if (answers[currentQuestionIndex]?.every(a => a.trim())) {
            handleSubmitAnswer();
          }
        } else {
          // If submitted, go to next
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isStarted, isFinished, isSubmitting, isSubmitted, answers, currentQuestionIndex, handleSubmitAnswer, handleNext]);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content-narrow">
          <Link href="/" className="back-link">
            <ArrowLeft className="w-4 h-4" />
            {t("backToHome")}
          </Link>
          <div className="flex justify-center pt-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !exercise || (isStarted && !isFinished && !currentQuestion)) {
    return (
      <div className="page-container">
        <div className="page-content-narrow">
          <Link href="/" className="back-link">
            <ArrowLeft className="w-4 h-4" />
            {t("backToHome")}
          </Link>
          <div className="text-center">
            <div className="card border-red-100 p-8">
              <p className="text-red-600 mb-4 font-medium">{error || tEdit("somethingWentWrong")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    // Only show the tiny spinner if we had a stored name on initial load
    const showAutoStartSpinner = hadStoredNameOnLoad && !!studentName.trim();
    // If we already have the student's name from storage, auto-start and show only a tiny spinner with no text
    if (showAutoStartSpinner) {
      return (
        <div className="page-container">
          <div className="page-content-narrow">
            <Link href="/" className="back-link">
              <ArrowLeft className="w-4 h-4" />
              {t("backToHome")}
            </Link>
            <div className="flex justify-center pt-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      );
    }

    // No stored name: show the regular name entry form
    return (
      <div className="page-container">
        <div className="page-content-narrow">
          <Link href="/" className="back-link">
            <ArrowLeft className="w-4 h-4" />
            {t("backToHome")}
          </Link>
          <div className="card p-4 md:p-10">
            <div className="mb-4 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-3">{exercise.title}</h1>
              <p className="text-slate-500">{t("enterName")}</p>
            </div>

            <form onSubmit={handleStart} className="space-y-3 md:space-y-6">
              <div>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="input-field font-medium"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !studentName.trim()}
                className="w-full btn-primary"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : t("start")}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="page-container">
        <div className="page-content-centered">
          <Link href="/" className="back-link justify-center">
            <ArrowLeft className="w-4 h-4" />
            {t("backToHome")}
          </Link>
          <div className="card p-5 md:p-12">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6">
              <svg width="32" height="32" md-width="40" md-height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10">
                <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">{t("exerciseCompleted")}</h1>
          
            <div className="bg-slate-50/80 rounded-2xl p-4 md:p-8 mb-4 md:mb-8 border border-slate-100">
              <p className="text-4xl md:text-5xl font-bold text-slate-900 mb-1 md:mb-2">
                {correctAnswersCount} <span className="text-xl md:text-2xl text-slate-400">/ {exercise.questions?.length || 0}</span>
              </p>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-xs md:text-sm">{t("correct")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content-narrow">
        <Link href="/" className="back-link">
          <ArrowLeft className="w-4 h-4" />
          {t("backToHome")}
        </Link>
        <div className="card overflow-hidden">
          <div className="px-3 py-3 md:px-6 md:py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h1 className="font-bold text-slate-900 line-clamp-2 md:truncate max-w-[80%] md:max-w-[70%]">{exercise.title}</h1>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm font-bold text-slate-500 whitespace-nowrap">
                {t("questionProgress", {
                  current: currentQuestionIndex + 1,
                  total: exercise.questions?.length || 0,
                })}
              </span>
            </div>
          </div>

          <div className="p-3 md:p-10">
            <QuestionRenderer
              question={currentQuestion!}
              type={exercise.type}
              values={answers[currentQuestionIndex]}
              onChange={(value, gapIndex = 0) => {
                if (isSubmitted) return;
                const newAnswers = [...answers];
                const questionAnswers = [...newAnswers[currentQuestionIndex]];
                questionAnswers[gapIndex] = value;
                newAnswers[currentQuestionIndex] = questionAnswers;
                setAnswers(newAnswers);
              }}
              isSubmitted={isSubmitted}
              isCorrect={results[currentQuestionIndex] ? (results[currentQuestionIndex]?.answers?.every(a => a.isCorrect) ?? false) : null}
              gapResults={results[currentQuestionIndex]?.answers}
            />
          </div>

          <div className="px-3 py-2.5 md:px-8 md:py-6 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center">
            {currentQuestionIndex > 0 ? (
              <button
                onClick={handlePrevious}
                className="btn-ghost"
              >
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
                <button
                  onClick={handleNext}
                  className="btn-primary px-4 md:px-8"
                >
                  {currentQuestionIndex === (exercise.questions?.length || 0) - 1 ? t("finish") : t("next")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

