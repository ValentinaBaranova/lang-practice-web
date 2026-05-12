"use client";

import { use, useState } from "react";
import { useRouter, Link } from "@/routing";
import { ExerciseType } from "@/app/types/exercise";
import { useTranslations } from "next-intl";
import { Save, ArrowLeft } from "lucide-react";

export default function NewExercisePage({
  params,
}: {
  params: Promise<{ teacherId: string; locale: string }>;
}) {
  const { teacherId } = use(params);
  const router = useRouter();
  const t = useTranslations("EditExercise");

  const [title, setTitle] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setErrors([]);

    // Basic validation
    if (!bulkInput.trim()) {
      setError(t("validationError"));
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
        const errorData = await response.json().catch(() => ({}));
        if (errorData.errors && Array.isArray(errorData.errors)) {
          setErrors(errorData.errors);
        } else {
          setError(errorData.message || t("failedToCreate"));
        }
        throw new Error(errorData.message || t("failedToCreate"));
      }

      router.push(`/teachers/${teacherId}/exercises`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {t("createTitle")}
          </h1>
          <p className="text-slate-500">{t("createSubtitle")}</p>
        </div>

        {error && !errors.length && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {errors.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            {errors.map((err, index) => (
              <div key={index} className="alert-error mb-0">
                {err}
              </div>
            ))}
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
            {isSubmitting ? t("creating") : t("save")}
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
