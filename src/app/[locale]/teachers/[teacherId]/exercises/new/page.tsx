"use client";

import { use, useState } from "react";
import { useRouter } from "@/routing";
import { ExerciseType, Question } from "@/app/types/exercise";

const translations = {
  en: {
    title: "Create New Exercise",
    teacherId: "Teacher ID",
    exerciseTitle: "Exercise Title",
    exerciseTitlePlaceholder: "e.g. Present Simple Practice",
    questions: "Questions",
    addQuestion: "+ Add Question",
    question: "Question",
    remove: "Remove",
    promptLabel: 'Prompt (e.g. "The cat is on the ____.")',
    answerLabel: "Correct Answer",
    create: "Create Exercise",
    creating: "Creating...",
    cancel: "Cancel",
    validationError: "Please fill in all questions and answers.",
    failedToCreate: "Failed to create exercise",
    somethingWentWrong: "Something went wrong",
  },
  es: {
    title: "Crear Nuevo Ejercicio",
    teacherId: "ID del Profesor",
    exerciseTitle: "Título del Ejercicio",
    exerciseTitlePlaceholder: "ej. Práctica de Presente Simple",
    questions: "Preguntas",
    addQuestion: "+ Añadir Pregunta",
    question: "Pregunta",
    remove: "Eliminar",
    promptLabel: 'Enunciado (ej. "El gato está en el ____.")',
    answerLabel: "Respuesta Correcta",
    create: "Crear Ejercicio",
    creating: "Creando...",
    cancel: "Cancelar",
    validationError: "Por favor, complete todas las preguntas y respuestas.",
    failedToCreate: "Error al crear el ejercicio",
    somethingWentWrong: "Algo salió mal",
  },
};

export default function NewExercisePage({
  params,
}: {
  params: Promise<{ teacherId: string; locale: string }>;
}) {
  const { teacherId, locale } = use(params);
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] || translations.en;

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { prompt: "", correctAnswer: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddQuestion = () => {
    setQuestions([...questions, { prompt: "", correctAnswer: "" }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (questions.some((q) => !q.prompt || !q.correctAnswer)) {
      setError(t.validationError);
      setIsSubmitting(false);
      return;
    }

    const dto = {
      teacherId,
      title,
      type: ExerciseType.FILL_GAP_TEXT,
      questions,
    };

    try {
      const response = await fetch("/api/exercise-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error(t.failedToCreate);
      }

      router.push(`/teachers/${teacherId}/exercises`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.somethingWentWrong);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
      <p className="mb-6 text-gray-600">
        {t.teacherId}: {teacherId}
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t.exerciseTitle}
          </label>
          <input
            id="title"
            type="text"
            required
            className="border border-gray-300 p-2 w-full rounded-md"
            placeholder={t.exerciseTitlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {t.questions}
            </h2>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-sm bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded border border-green-200 transition-colors"
            >
              {t.addQuestion}
            </button>
          </div>

          {questions.map((question, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3 relative"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">
                  {t.question} {index + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    {t.remove}
                  </button>
                )}
              </div>

              <div>
                <label
                  htmlFor={`prompt-${index}`}
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  {t.promptLabel}
                </label>
                <input
                  id={`prompt-${index}`}
                  type="text"
                  required
                  className="bg-white border border-gray-300 p-2 w-full rounded-md text-sm"
                  value={question.prompt}
                  onChange={(e) =>
                    handleQuestionChange(index, "prompt", e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  htmlFor={`answer-${index}`}
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  {t.answerLabel}
                </label>
                <input
                  id={`answer-${index}`}
                  type="text"
                  required
                  className="bg-white border border-gray-300 p-2 w-full rounded-md text-sm"
                  value={question.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(index, "correctAnswer", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:bg-blue-300"
          >
            {isSubmitting ? t.creating : t.create}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
