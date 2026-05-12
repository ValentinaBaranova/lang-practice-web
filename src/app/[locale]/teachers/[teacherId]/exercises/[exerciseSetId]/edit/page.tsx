"use client";

import { use, useState, useEffect } from "react";
import { useRouter, Link } from "@/routing";
import { useTranslations } from "next-intl";
import { Question } from "@/app/types/exercise";
import { Save, ArrowLeft } from "lucide-react";


export default function EditExerciseSetPage({
  params,
}: {
  params: Promise<{ teacherId: string; exerciseSetId: string; locale: string }>;
}) {
  const { teacherId, exerciseSetId } = use(params);
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
    <div className="page-container">
      <div className="content-wrapper pb-12">
        <Link
          href={`/teachers/${teacherId}/exercises`}
          className="back-link"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-slate-500">{t("editSubtitle")}</p>
        </div>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        <div className="card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-slate-900 mb-2"
                >
                  {t("exerciseTitle")}
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  className="input-field"
                  placeholder={t("exerciseTitlePlaceholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="mt-2 text-sm text-slate-500">
                  {t("exerciseTitleHelper")}
                </p>
              </div>

              <div className="pt-4">
                <label
                  htmlFor="bulkInput"
                  className="block text-sm font-semibold text-slate-900 mb-2"
                >
                  {t("questions")}
                </label>
                <div className="relative">
                  <textarea
                    id="bulkInput"
                    required
                    rows={8}
                    className="input-field font-mono text-sm leading-relaxed"
                    placeholder={t("bulkInputPlaceholder")}
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {t("bulkInputHelper")}
                </p>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSubmit}
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? t("saving") : t("save")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/teachers/${teacherId}/exercises`)}
            className="btn-secondary"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
