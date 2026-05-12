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
        throw new Error(t("failedToCreate"));
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
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <Link
          href={`/teachers/${teacherId}/exercises`}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-8 transition-colors"
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
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
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm leading-relaxed"
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
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
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
            className="flex items-center justify-center px-8 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
