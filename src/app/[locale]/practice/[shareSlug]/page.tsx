"use client";

import { use, useState, useEffect } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/exercise-sets/share/${shareSlug}`);
        if (!response.ok) {
          throw new Error(tEdit("failedToLoad"));
        }
        const data = await response.json();
        setExercise(data);
        setAnswers(new Array(data.questions.length).fill(""));
      } catch (err) {
        setError(err instanceof Error ? err.message : tEdit("somethingWentWrong"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [shareSlug, tEdit]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      setIsStarted(true);
    }
  };

  const handleNext = () => {
    if (exercise && currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <p className="text-red-600 mb-4">{error || tEdit("somethingWentWrong")}</p>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 mt-10">
        <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("enterName")}
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t("start")}
          </button>
        </form>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center bg-white rounded-xl shadow-md mt-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("exerciseCompleted")}</h1>
        <p className="text-xl text-gray-700">{t("wellDone", { name: studentName })}</p>
      </div>
    );
  }

  const currentQuestion = exercise.questions[currentQuestionIndex];

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-md mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">{exercise.title}</h1>
        <span className="text-sm text-gray-500">
          {t("questionProgress", {
            current: currentQuestionIndex + 1,
            total: exercise.questions.length,
          })}
        </span>
      </div>

      <div className="mb-8">
        <QuestionRenderer
          question={currentQuestion}
          type={exercise.type}
          value={answers[currentQuestionIndex]}
          onChange={handleAnswerChange}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
        >
          {currentQuestionIndex === exercise.questions.length - 1 ? t("finish") : t("next")}
        </button>
      </div>
    </div>
  );
}

function QuestionRenderer({
  question,
  type,
  value,
  onChange,
}: {
  question: Question;
  type: ExerciseType;
  value: string;
  onChange: (val: string) => void;
}) {
  if (type === ExerciseType.FILL_GAP_TEXT) {
    // Split by one or more underscores
    const parts = question.prompt.split(/_+/);
    
    return (
      <div className="text-lg leading-relaxed flex flex-wrap items-baseline gap-y-2">
        {parts.map((part, index) => (
          <span key={index} className="flex items-baseline">
            <span>{part}</span>
            {index < parts.length - 1 && (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mx-2 p-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none w-32 text-center"
                autoFocus
              />
            )}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-lg">{question.prompt}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      />
    </div>
  );
}
