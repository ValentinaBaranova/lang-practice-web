"use client";

import { use, useState } from "react";
import { useRouter, Link } from "@/routing";
import { ExerciseType, ExerciseVisibility } from "@/app/types/exercise";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import ExerciseForm from "@/components/ExerciseForm";

export default function NewExercisePage({
  params,
}: {
  params: Promise<{ accessCode: string; locale: string }>;
}) {
  const { accessCode } = use(params);
  const router = useRouter();
  const t = useTranslations("EditExercise");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (data: {
    title: string;
    type: ExerciseType;
    visibility: ExerciseVisibility;
    bulkInput: string;
  }) => {
    setIsSubmitting(true);
    setError(null);
    setErrors([]);

    const dto = {
      teacherAccessCode: accessCode,
      ...data,
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

      router.push(`/teachers/${accessCode}/exercises`);
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
          href={`/teachers/${accessCode}/exercises`}
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

        <ExerciseForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText={t("save")}
          submittingButtonText={t("creating")}
          onCancel={() => router.push(`/teachers/${accessCode}/exercises`)}
          externalError={error}
          externalErrors={errors}
        />
      </div>
    </div>
  );
}
