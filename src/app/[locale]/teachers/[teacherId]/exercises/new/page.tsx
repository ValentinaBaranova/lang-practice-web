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
    bulkInputLabel: "Questions",
    bulkInputPlaceholder: "I [went] to [school] yesterday.\nI have an [apple].",
    bulkInputHelper: "Format: Text with [answers] in brackets. One question per line.",
    create: "Create Exercise",
    creating: "Creating...",
    cancel: "Cancel",
    validationError: "Please check your input. Each line must contain at least one answer in [].",
    failedToCreate: "Failed to create exercise",
    somethingWentWrong: "Something went wrong",
  },
  es: {
    title: "Crear Nuevo Ejercicio",
    teacherId: "ID del Profesor",
    exerciseTitle: "Título del Ejercicio",
    exerciseTitlePlaceholder: "ej. Práctica de Presente Simple",
    bulkInputLabel: "Preguntas",
    bulkInputPlaceholder: "Yo [fui] a la [escuela] ayer.\nTengo una [manzana].",
    bulkInputHelper: "Formato: Texto con [respuestas] entre corchetes. Una pregunta por línea.",
    create: "Crear Ejercicio",
    creating: "Creando...",
    cancel: "Cancelar",
    validationError: "Por favor, verifique su entrada. Cada línea debe contener al menos una respuesta entre [].",
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
  const [bulkInput, setBulkInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (!bulkInput.trim()) {
      setError(t.validationError);
      setIsSubmitting(false);
      return;
    }

    const dto = {
      teacherId,
      title,
      type: ExerciseType.FILL_GAP_TEXT,
      bulkInput,
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

        <div className="space-y-4">
          <div>
            <label
              htmlFor="bulkInput"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.bulkInputLabel}
            </label>
            <textarea
              id="bulkInput"
              required
              rows={10}
              className="border border-gray-300 p-2 w-full rounded-md font-mono text-sm"
              placeholder={t.bulkInputPlaceholder}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">{t.bulkInputHelper}</p>
          </div>
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
