'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from 'lucide-react';
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "@/routing";
import { useAuth } from "@/components/AuthProvider";
import { ExerciseType } from "@/app/types/exercise";
import { QUICK_PRACTICE_DAILY_LIMIT } from "@/lib/config";

export default function QuickPracticeSetup() {
  const t = useTranslations("HomePage");
  const tEdit = useTranslations("EditExercise");
  const { teacher } = useAuth();
  const router = useRouter();

  const [aiTopic, setAiTopic] = useState("");
  const [exerciseType, setExerciseType] = useState<ExerciseType>(ExerciseType.FILL_GAP_TEXT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetchWithAuth("/api/topics");
        if (response.ok) {
          const data = await response.json();
          setSuggestedTopics(data);
        }
      } catch (error) {
        console.error("Failed to fetch topics", error);
      }
    };
    fetchTopics();
  }, []);

  const handleGenerateAndStart = async () => {
    // Check limit for unauthorized users
    if (!teacher) {
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem("quickPracticeLastDate");
      let count = parseInt(localStorage.getItem("quickPracticeCount") || "0");

      if (lastDate !== today) {
        count = 0;
        localStorage.setItem("quickPracticeLastDate", today);
        localStorage.setItem("quickPracticeCount", "0");
      }

      if (count >= QUICK_PRACTICE_DAILY_LIMIT) {
        setAiError(tEdit("dailyLimitReached"));
        return;
      }
    }

    setIsGenerating(true);
    setAiError(null);
    try {
      const response = await fetchWithAuth("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: exerciseType,
          topic: aiTopic || "Presente",
          amount: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(tEdit("aiGenerationFailed"));
      }

      const data = await response.json();
      if (data.content.startsWith("ERROR:")) {
         setAiError(data.content.replace("ERROR: ", ""));
      } else if (data.questions && data.questions.length > 0) {
        // Increment count for unauthorized user
        if (!teacher) {
          const count = parseInt(localStorage.getItem("quickPracticeCount") || "0");
          localStorage.setItem("quickPracticeCount", (count + 1).toString());
        }

        sessionStorage.setItem("quickPracticeExercise", JSON.stringify({
          title: aiTopic || "Practice",
          type: exerciseType,
          questions: data.questions
        }));
        router.push("/quick-practice");
      } else {
        setAiError(tEdit("aiGenerationFailed"));
      }
    } catch {
      setAiError(tEdit("somethingWentWrong"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="card p-6 md:p-8 mb-8 bg-gradient-to-br from-white to-indigo-50/30 border-indigo-100/50">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 w-full">
          <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            {t("oneTimeExerciseTitle")}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {t("oneTimeExerciseDesc")}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                {tEdit("aiTopicLabel")}
              </label>
              <input
                type="text"
                className="input-field py-2"
                placeholder={tEdit("aiTopicPlaceholder")}
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestedTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setAiTopic(topic)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border ${
                      aiTopic === topic
                        ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                {tEdit("exerciseType")}
              </label>
              <select
                className="input-field py-2"
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
              >
                <option value={ExerciseType.FILL_GAP_TEXT}>{tEdit("typeFillInBlank")}</option>
                <option value={ExerciseType.MULTIPLE_CHOICE}>{tEdit("typeMultipleChoice")}</option>
              </select>
            </div>
          </div>
          
          {aiError && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 border border-red-100">
              {aiError}
            </div>
          )}

          <button
            onClick={handleGenerateAndStart}
            disabled={isGenerating}
            className="btn-primary w-full md:w-auto px-8 py-2.5 flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? tEdit("generatingAI") : t("generateAndStart")}
          </button>
        </div>
      </div>
    </div>
  );
}
