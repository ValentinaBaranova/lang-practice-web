"use client";

import { useState } from "react";
import { ExerciseType, ExerciseVisibility } from "@/app/types/exercise";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";

interface ExerciseFormProps {
  initialTitle?: string;
  initialType?: ExerciseType;
  initialVisibility?: ExerciseVisibility;
  initialBulkInput?: string;
  onSubmit: (data: {
    title: string;
    type: ExerciseType;
    visibility: ExerciseVisibility;
    bulkInput: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
  submittingButtonText: string;
  onCancel: () => void;
  isEditMode?: boolean;
  externalError?: string | null;
  externalErrors?: string[];
}

export default function ExerciseForm({
  initialTitle = "",
  initialType = ExerciseType.FILL_GAP_TEXT,
  initialVisibility = ExerciseVisibility.PRIVATE,
  initialBulkInput = "",
  onSubmit,
  isSubmitting,
  submitButtonText,
  submittingButtonText,
  onCancel,
  isEditMode = false,
  externalError = null,
  externalErrors = [],
}: ExerciseFormProps) {
  const t = useTranslations("EditExercise");
  const [title, setTitle] = useState(initialTitle);
  const [type, setType] = useState<ExerciseType>(initialType);
  const [visibility, setVisibility] = useState<ExerciseVisibility>(initialVisibility);
  const [bulkInput, setBulkInput] = useState(initialBulkInput);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!bulkInput.trim()) {
      setLocalError(t("validationError"));
      return;
    }

    await onSubmit({ title, type, visibility, bulkInput });
  };

  const showError = localError || externalError;

  return (
    <>
      {showError && !externalErrors.length && (
        <div className="alert-error">{showError}</div>
      )}

      {externalErrors.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          {externalErrors.map((err, index) => (
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
              <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-2">
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
              <p className="mt-2 text-sm text-slate-500">{t("exerciseTitleHelper")}</p>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-slate-900 mb-2">
                {t("exerciseType")}
              </label>
              <select
                id="type"
                className={`input-field ${isEditMode ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={isEditMode}
                value={type}
                onChange={(e) => setType(e.target.value as ExerciseType)}
              >
                <option value={ExerciseType.FILL_GAP_TEXT}>{t("typeFillInBlank")}</option>
                <option value={ExerciseType.MULTIPLE_CHOICE}>{t("typeMultipleChoice")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="visibility" className="block text-sm font-semibold text-slate-900 mb-2">
                {t("visibility")}
              </label>
              <select
                id="visibility"
                className="input-field"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ExerciseVisibility)}
              >
                <option value={ExerciseVisibility.PRIVATE}>{t("visibilityPrivate")}</option>
                <option value={ExerciseVisibility.PUBLIC}>{t("visibilityPublic")}</option>
              </select>
            </div>

            <div className="pt-4">
              <label htmlFor="bulkInput" className="block text-sm font-semibold text-slate-900 mb-2">
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
                {type === ExerciseType.MULTIPLE_CHOICE
                  ? t("bulkInputHelperMultipleChoice")
                  : t("bulkInputHelper")}
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
          {isSubmitting ? submittingButtonText : submitButtonText}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t("cancel")}
        </button>
      </div>
    </>
  );
}
