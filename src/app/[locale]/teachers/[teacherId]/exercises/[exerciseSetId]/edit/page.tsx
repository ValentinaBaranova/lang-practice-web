"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "@/routing";
import { useTranslations } from "next-intl";
import { ExerciseType, Question } from "@/app/types/exercise";


export default function EditExerciseSetPage({
  params,
}: {
  params: Promise<{ teacherId: string; exerciseSetId: string; locale: string }>;
}) {
  const { teacherId, exerciseSetId, locale } = use(params);
  const router = useRouter();
  const t = useTranslations("EditExercise");

  const [title, setTitle] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/exercise-sets/${exerciseSetId}`);
        if (!response.ok) {
          throw new Error(t("failedToLoad"));
        }
        const data = await response.json();
        setTitle(data.title);
        const reconstructedInput = (data.questions || [])
          .map((q: Question) => q.sourceText)
          .join("\n");
        setBulkInput(reconstructedInput);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("somethingWentWrong"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseSetId, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (!bulkInput.trim()) {
      setError(t("validationError"));
      setIsSubmitting(false);
      return;
    }

    const dto = {
      title,
      bulkInput,
    };

    try {
      const response = await fetch(`/api/exercise-sets/${exerciseSetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error(t("failedToUpdate"));
      }

      router.push(`/teachers/${teacherId}/exercises`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <p className="mb-6 text-gray-600">
        {t("teacherId")}: {teacherId}
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
            {t("exerciseTitle")}
          </label>
          <input
            id="title"
            type="text"
            required
            className="border border-gray-300 p-2 w-full rounded-md"
            placeholder={t("exerciseTitlePlaceholder")}
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
              {t("bulkInputLabel")}
            </label>
            <textarea
              id="bulkInput"
              required
              rows={10}
              className="border border-gray-300 p-2 w-full rounded-md font-mono text-sm"
              placeholder={t("bulkInputPlaceholder")}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">{t("bulkInputHelper")}</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:bg-blue-300"
          >
            {isSubmitting ? t("saving") : t("save")}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
