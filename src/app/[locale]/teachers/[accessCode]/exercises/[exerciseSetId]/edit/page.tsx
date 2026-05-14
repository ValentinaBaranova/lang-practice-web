"use client";

import { use, useState, useEffect } from "react";
import { useRouter, Link } from "@/routing";
import { useTranslations } from "next-intl";
import { Question, ExerciseType, ExerciseVisibility } from "@/app/types/exercise";
import { ArrowLeft } from "lucide-react";
import ExerciseForm from "@/components/ExerciseForm";

export default function EditExerciseSetPage({
  params,
}: {
  params: Promise<{ accessCode: string; exerciseSetId: string; locale: string }>;
}) {
  const { accessCode, exerciseSetId } = use(params);
  const router = useRouter();
  const t = useTranslations("EditExercise");

  const [initialData, setInitialData] = useState<{
    title: string;
    type: ExerciseType;
    visibility: ExerciseVisibility;
    bulkInput: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/exercise-sets/${exerciseSetId}`);
        if (!response.ok) {
          throw new Error(t("failedToLoad"));
        }
        const data = await response.json();
        const reconstructedInput = (data.questions || [])
          .map((q: Question) => q.sourceText)
          .join("\n");
        
        setInitialData({
          title: data.title,
          type: data.type,
          visibility: data.visibility || ExerciseVisibility.PRIVATE,
          bulkInput: reconstructedInput,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : t("somethingWentWrong"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseSetId, t]);

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
      title: data.title,
      visibility: data.visibility,
      bulkInput: data.bulkInput,
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
        const errorData = await response.json().catch(() => ({}));
        if (errorData.errors && Array.isArray(errorData.errors)) {
          setErrors(errorData.errors);
        } else {
          setError(errorData.message || t("failedToUpdate"));
        }
        throw new Error(errorData.message || t("failedToUpdate"));
      }

      router.push(`/teachers/${accessCode}/exercises`);
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
          href={`/teachers/${accessCode}/exercises`}
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

        {initialData && (
          <ExerciseForm
            initialTitle={initialData.title}
            initialType={initialData.type}
            initialVisibility={initialData.visibility}
            initialBulkInput={initialData.bulkInput}
            teacherAccessCode={accessCode}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText={t("save")}
            submittingButtonText={t("saving")}
            onCancel={() => router.push(`/teachers/${accessCode}/exercises`)}
            isEditMode={true}
            externalError={error}
            externalErrors={errors}
          />
        )}
      </div>
    </div>
  );
}
