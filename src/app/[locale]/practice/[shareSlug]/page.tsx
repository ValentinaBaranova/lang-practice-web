"use client";

import { use, useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ExerciseType, Question, ExerciseSetDto } from "@/app/types/exercise";

interface ExerciseResponse extends Omit<ExerciseSetDto, 'teacherId'> {
    id: string;
    teacherName: string;
    shareSlug: string;
}

export default function PracticePage({
  params,
}: {
  params: Promise<{ shareSlug: string; locale: string }>;
}) {
  const { shareSlug } = use(params);
  const t = useTranslations("Practice");
  const tEdit = useTranslations("EditExercise");

  const [studentName, setStudentName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [exercise, setExercise] = useState<ExerciseResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[][]>([]);
  const [results, setResults] = useState<(boolean | null)[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const correctAnswersCount = results.filter((r) => r === true).length;

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/exercise-sets/share/${shareSlug}`);
        if (!response.ok) {
          throw new Error(tEdit("failedToLoad"));
        }
        const data = await response.json();
        setExercise(data);
        
        // Initialize answers as an array of arrays, one per question
        const initialAnswers = data.questions.map((q: Question) => {
          if (data.type === ExerciseType.FILL_GAP_TEXT) {
            const gapCount = (q.prompt.match(/_+/g) || []).length;
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

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !exercise) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseSetId: exercise.id,
          studentName: studentName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(tEdit("somethingWentWrong"));
      }

      const data = await response.json();
      setAttemptId(data.id);
      setIsStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : tEdit("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!attemptId || !exercise || isSubmitting) return;

    const currentQuestion = exercise.questions[currentQuestionIndex];
    const questionAnswers = answers[currentQuestionIndex];

    if (questionAnswers.some(a => !a.trim())) return;

    let fullSentence = "";
    if (exercise.type === ExerciseType.FILL_GAP_TEXT) {
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
      const response = await fetch(`/api/attempts/${attemptId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: fullSentence.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(tEdit("somethingWentWrong"));
      }

      const data = await response.json();
      const newResults = [...results];
      newResults[currentQuestionIndex] = data.isCorrect;
      setResults(newResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : tEdit("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (exercise && currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = exercise?.questions[currentQuestionIndex];
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
        <div className="content-wrapper flex justify-center pt-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <div className="card border-red-100 p-8">
            <p className="text-red-600 mb-4 font-medium">{error || tEdit("somethingWentWrong")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="page-container">
        <div className="page-content-narrow">
          <div className="card p-8 md:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-3">{exercise.title}</h1>
              <p className="text-slate-500">{t("enterName")}</p>
            </div>
            
            <form onSubmit={handleStart} className="space-y-6">
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
          <div className="card p-10 md:p-12">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t("exerciseCompleted")}</h1>
            <p className="text-xl text-slate-500 mb-8 font-medium">{t("wellDone", { name: studentName })}</p>
            
            <div className="bg-slate-50/80 rounded-2xl p-8 mb-8 border border-slate-100">
              <p className="text-5xl font-bold text-slate-900 mb-2">
                {correctAnswersCount} <span className="text-2xl text-slate-400">/ {exercise.questions.length}</span>
              </p>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">{t("correct")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content-narrow">
        <div className="card overflow-hidden">
          <div className="px-6 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h1 className="font-bold text-slate-900 truncate max-w-[70%]">{exercise.title}</h1>
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm whitespace-nowrap">
              {t("questionProgress", {
                current: currentQuestionIndex + 1,
                total: exercise.questions.length,
              })}
            </span>
          </div>

          <div className="p-8 md:p-10">
            <QuestionRenderer
              question={currentQuestion}
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
              isCorrect={results[currentQuestionIndex]}
            />
          </div>

          <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="btn-ghost"
            >
              {t("previous")}
            </button>
            
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
                <button
                  onClick={handleNext}
                  className="btn-primary px-8"
                >
                  {currentQuestionIndex === exercise.questions.length - 1 ? t("finish") : t("next")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionRenderer({
  question,
  type,
  values,
  onChange,
  isSubmitted,
  isCorrect,
}: {
  question: Question;
  type: ExerciseType;
  values: string[];
  onChange: (val: string, index: number) => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
}) {
  const t = useTranslations("Practice");
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSubmitted) {
      firstInputRef.current?.focus();
    }
  }, [question.id, isSubmitted]);

  const feedback = isSubmitted && (
    <div className={`mt-8 p-6 rounded-2xl border ${
      isCorrect 
        ? "bg-emerald-50/50 border-emerald-100 text-emerald-900" 
        : "bg-red-50/50 border-red-100 text-red-900"
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isCorrect ? "bg-emerald-100" : "bg-red-100"
        }`}>
          {isCorrect ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <p className="font-bold">
          {isCorrect ? t("correct") : t("incorrect")}
        </p>
      </div>
      {!isCorrect && question.correctAnswer && (
        <p className="text-slate-600 ml-11">
          {t("correctAnswer", { answer: question.correctAnswer })}
        </p>
      )}
    </div>
  );

  if (type === ExerciseType.FILL_GAP_TEXT) {
    // Split by one or more underscores
    const parts = question.prompt.split(/_+/);
    
    return (
      <div className="space-y-6">
        <div className="text-xl md:text-2xl leading-relaxed text-slate-800 flex flex-wrap items-baseline gap-x-1 gap-y-4">
          {parts.map((part, index) => (
            <span key={index} className="inline-flex items-baseline">
              <span>{part}</span>
              {index < parts.length - 1 && (
                <input
                  ref={index === 0 ? firstInputRef : null}
                  type="text"
                  value={values[index] || ""}
                  onChange={(e) => onChange(e.target.value, index)}
                  disabled={isSubmitted}
                  className={`mx-2 px-4 py-1 border-b-2 outline-none w-40 text-center transition-all font-bold ${
                    isSubmitted 
                      ? (isCorrect ? "border-emerald-500 text-emerald-600 bg-emerald-50/30" : "border-red-500 text-red-600 bg-red-50/30") 
                      : "border-slate-200 focus:border-indigo-500 text-indigo-600 placeholder:text-slate-300"
                  }`}
                  autoFocus={index === 0}
                />
              )}
            </span>
          ))}
        </div>
        {feedback}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-2xl font-medium text-slate-800 leading-relaxed">{question.prompt}</p>
      <input
        ref={firstInputRef}
        type="text"
        value={values[0] || ""}
        onChange={(e) => onChange(e.target.value, 0)}
        disabled={isSubmitted}
        className={`w-full px-6 py-4 border-2 rounded-xl transition-all outline-none text-xl font-bold ${
          isSubmitted 
            ? (isCorrect ? "border-emerald-500 text-emerald-600 bg-emerald-50/30" : "border-red-500 text-red-600 bg-red-50/30") 
            : "border-slate-100 focus:border-indigo-500 text-indigo-600 bg-slate-50/50 focus:bg-white shadow-sm"
        }`}
      />
      {feedback}
    </div>
  );
}
