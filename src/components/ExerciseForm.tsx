"use client";

import { useState } from "react";
import { ExerciseType, ExerciseVisibility } from "@/app/types/exercise";
import { useTranslations } from "next-intl";
import { Save, Sparkles, Copy, Check } from "lucide-react";
import { getApiUrl } from "@/lib/api";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiAmount, setAiAmount] = useState(10);
  const [isCopying, setIsCopying] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleCopyPrompt = async () => {
    setIsCopying(true);
    setAiError(null);
    try {
      const topicParam = aiTopic || title || "preterito indefinido";
      const response = await fetch(
        getApiUrl(`/api/ai/build-exercise-prompt?type=${type}&topic=${encodeURIComponent(topicParam)}&amount=${aiAmount}`)
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      const prompt = data.prompt;

      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setAiError(t("somethingWentWrong"));
    } finally {
      setIsCopying(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setLocalError(null);
    setAiError(null);
    try {
      const response = await fetch(getApiUrl("/api/ai/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          topic: aiTopic || title,
          amount: aiAmount,
        }),
      });

      if (!response.ok) {
        throw new Error(t("somethingWentWrong"));
      }

      const data = await response.json();
      if (data.content.startsWith("ERROR:")) {
        setAiError(t("aiGenerationFailed"));
      } else {
        setBulkInput(data.content);
      }
    } catch {
      setAiError(t("somethingWentWrong"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!bulkInput.trim()) {
      setLocalError(t("validationError"));
      return;
    }

    // Basic frontend validation to catch obvious format errors
    const lines = bulkInput.split("\n").filter(l => l.trim());
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.includes("[") || !line.includes("]")) {
        setLocalError(t("validationErrorLine", { line: i + 1 }));
        return;
      }
      if (type === ExerciseType.MULTIPLE_CHOICE) {
        if (!line.includes("{") || !line.includes("}")) {
          setLocalError(t("validationErrorMultipleChoice", { line: i + 1 }));
          return;
        }
      }
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
              <div className="flex flex-col gap-3 mb-3">
                <p className="text-sm text-slate-500 whitespace-pre-line">
                  {type === ExerciseType.MULTIPLE_CHOICE
                    ? t("bulkInputHelperMultipleChoice")
                    : t("bulkInputHelper")}
                </p>
                <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="aiTopic" className="block text-xs font-semibold text-slate-700 mb-1">
                        {t("aiTopicLabel")}
                      </label>
                      <input
                        id="aiTopic"
                        type="text"
                        className="input-field py-1.5 text-xs"
                        placeholder={t("aiTopicPlaceholder")}
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="aiAmount" className="block text-xs font-semibold text-slate-700 mb-1">
                        {t("aiAmountLabel")}
                      </label>
                      <input
                        id="aiAmount"
                        type="number"
                        min="1"
                        max="50"
                        className="input-field py-1.5 text-xs"
                        value={aiAmount}
                        onChange={(e) => setAiAmount(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isGenerating ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {isGenerating ? t("generatingAI") : t("generateAI")}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      disabled={isCopying}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-all shadow-sm disabled:opacity-50"
                    >
                      {isCopying ? (
                        <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      ) : copied ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {t("copyAIPrompt")}
                    </button>
                  </div>
                  {aiError && (
                    <div className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1 duration-200">
                      {aiError}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="bulkInput"
                  required
                  rows={8}
                  className="input-field font-mono text-sm leading-relaxed"
                  placeholder={
                    type === ExerciseType.MULTIPLE_CHOICE
                      ? t("bulkInputPlaceholderMultipleChoice")
                      : t("bulkInputPlaceholder")
                  }
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                />
              </div>
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
