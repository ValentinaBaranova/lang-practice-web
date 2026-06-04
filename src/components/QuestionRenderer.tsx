"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ExerciseType, Question } from "@/app/types/exercise";
import { GapAnswerResponse } from "@/app/types/api";

export default function QuestionRenderer({
  question,
  type,
  values,
  onChange,
  isSubmitted,
  isCorrect,
  gapResults,
}: {
  question: Question;
  type: ExerciseType;
  values: string[];
  onChange: (val: string, index: number) => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  gapResults?: GapAnswerResponse[];
}) {
  const t = useTranslations("Practice");
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSubmitted) {
      firstInputRef.current?.focus();
    }
  }, [question.id, isSubmitted]);

  const feedback = isSubmitted && (
    <div className={`mt-3 md:mt-8 p-3 md:p-6 rounded-2xl border ${
      isCorrect 
        ? "bg-emerald-50/50 border-emerald-100 text-emerald-900" 
        : "bg-red-50/50 border-red-100 text-red-900"
    }`}>
      <div className="flex items-center gap-3 mb-1 md:mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isCorrect ? "bg-emerald-100" : "bg-red-100"
        }`}>
          {isCorrect ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <p className="font-bold text-sm md:text-base">
          {isCorrect ? t("correct") : t("incorrect")}
        </p>
      </div>
      {!isCorrect && (
        <p className="text-slate-600 ml-11 text-sm md:text-base">
          {t("correctAnswer", { 
            answer: question.gaps && question.gaps.length > 1 
              ? question.sourceText.replace(/\[/g, "").replace(/\]/g, "").replace(/\{.*?\}/g, "")
              : question.gaps?.[0]?.correctAnswer 
          })}
        </p>
      )}
    </div>
  );

  if (type === ExerciseType.FILL_GAP_TEXT) {
    // Split by one or more underscores
    const parts = question.prompt.split(/_+/);
    
    return (
      <div className="space-y-3 md:space-y-6">
        <div className="text-lg md:text-2xl leading-relaxed text-slate-800">
          {parts.map((part, index) => (
            <span key={index} className="inline">
              <span className="whitespace-pre-wrap">{part}</span>
              {index < parts.length - 1 && (
                <input
                  ref={index === 0 ? firstInputRef : null}
                  type="text"
                  value={values[index] || ""}
                  onChange={(e) => onChange(e.target.value, index)}
                  disabled={isSubmitted}
                  className={`mx-0.5 md:mx-2 px-2 md:px-4 py-0 border-b-2 outline-none w-32 md:w-48 text-center transition-all font-bold inline-block align-baseline ${
                    isSubmitted 
                      ? (
                          gapResults?.find(r => r.index === index)
                          ? (gapResults.find(r => r.index === index)!.isCorrect ? "border-emerald-500 text-emerald-600 bg-emerald-50/30" : "border-red-500 text-red-600 bg-red-50/30")
                          : (isCorrect ? "border-emerald-500 text-emerald-600 bg-emerald-50/30" : "border-red-500 text-red-600 bg-red-50/30")
                        ) 
                      : "border-slate-200 focus:border-indigo-500 text-indigo-600 placeholder:text-slate-300"
                  }`}
                  autoFocus={index === 0}
                />
              )}
            </span>
          ))}
        </div>
        {feedback}
      </div>
    );
  }

  if (type === ExerciseType.MULTIPLE_CHOICE) {
    return (
      <div className="space-y-4 md:space-y-8">
        <p className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed">
          {question.prompt}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
          {(question.options || []).map((option, index) => {
            const isSelected = values[0] === option;
            let buttonClass = "w-full px-4 md:px-6 py-3 md:py-4 border-2 rounded-xl transition-all text-left font-semibold text-lg ";
            
            if (isSubmitted) {
              if (option === question.gaps?.[0]?.correctAnswer) {
                buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-700 ";
              } else if (isSelected && !isCorrect) {
                buttonClass += "border-red-500 bg-red-50 text-red-700 ";
              } else {
                buttonClass += "border-slate-100 text-slate-400 ";
              }
            } else {
              buttonClass += isSelected 
                ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm " 
                : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-700 ";
            }

            return (
              <button
                key={index}
                onClick={() => !isSubmitted && onChange(option, 0)}
                disabled={isSubmitted}
                className={buttonClass}
              >
                {option}
              </button>
            );
          })}
        </div>
        {feedback}
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-8">
      <p className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed">{question.prompt}</p>
      <input
        ref={firstInputRef}
        type="text"
        value={values[0] || ""}
        onChange={(e) => onChange(e.target.value, 0)}
        disabled={isSubmitted}
        className={`w-full px-4 md:px-6 py-3 md:py-4 border-2 rounded-xl transition-all outline-none text-lg md:text-xl font-bold ${
          isSubmitted 
            ? (isCorrect ? "border-emerald-500 text-emerald-600 bg-emerald-50/30" : "border-red-500 text-red-600 bg-red-50/30") 
            : "border-slate-100 focus:border-indigo-500 text-indigo-600 bg-slate-50/50 focus:bg-white shadow-sm"
        }`}
      />
      {feedback}
    </div>
  );
}
