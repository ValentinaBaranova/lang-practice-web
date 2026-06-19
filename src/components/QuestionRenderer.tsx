"use client";

import React, { useEffect, useRef } from "react";
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

  // Render full source sentence with bolded correct answers for multi-gap questions.
  // If a user's answer matches the correct answer exactly for a gap, do NOT bold it.
  const renderSourceWithBoldAnswers = (q: Question) => {
    const src = q.sourceText ?? "";
    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    let gapIdx = 0;
    let segIdx = 0;

    const stripHints = (text: string) => text.replace(/\{.*?\}/g, "");

    while (cursor < src.length) {
      const open = src.indexOf("[", cursor);
      if (open === -1) {
        const tail = src.slice(cursor);
        if (tail)
          nodes.push(
            <span key={`t-${segIdx++}`}>{stripHints(tail)}</span>
          );
        break;
      }
      // push text before gap
      const before = src.slice(cursor, open);
      if (before)
        nodes.push(
          <span key={`t-${segIdx++}`}>{stripHints(before)}</span>
        );

      // find closing bracket and replace gap with bold correct answer
      const close = src.indexOf("]", open + 1);
      if (close === -1) {
        // unmatched bracket, push rest and stop
        const rest = src.slice(open);
        if (rest)
          nodes.push(
            <span key={`t-${segIdx++}`}>{stripHints(rest)}</span>
          );
        break;
      }

      const answer = q.gaps?.[gapIdx]?.correctAnswer ?? "";
      const userVal = values?.[gapIdx] ?? undefined;
      const shouldBold = userVal !== answer; // exact match -> no bold
      nodes.push(
        shouldBold ? (
          <strong key={`ga-${gapIdx}`} className="font-bold">{answer}</strong>
        ) : (
          <span key={`ga-${gapIdx}`}>{answer}</span>
        )
      );
      gapIdx += 1;
      cursor = close + 1;
    }

    // Normalize children to ensure every child has a stable key (React.Children.toArray adds keys if missing)
    return <>{React.Children.toArray(nodes)}</>;
  };

  useEffect(() => {
    if (!isSubmitted) {
      firstInputRef.current?.focus();
    }
  }, [question.id, isSubmitted]);
  // Use simple trim + lowercase inequality as requested
  const expectedMismatchHints = gapResults?.filter(
    r => r.isCorrect && r.expectedAnswer != null && (r.answer ?? "").trim().toLowerCase() !== r.expectedAnswer!.trim().toLowerCase()
  );
  const isMultiGap = Boolean(question.gaps && question.gaps.length > 1);

  // Small helpers to render the localized "correct answer" line
  const renderCorrectAnswerPlain = (text: string) => (
    <p className="text-slate-600 ml-11 text-sm md:text-base">
      {t("correctAnswer", { answer: text })}
    </p>
  );
  const renderCorrectAnswerRich = () => (
    <p className="text-slate-600 ml-11 text-sm md:text-base">
      {t.rich("correctAnswer", {
        answer: (_chunks: React.ReactNode) => renderSourceWithBoldAnswers(question),
      })}
    </p>
  );

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
      {(() => {
        const hasExpectedMismatch = Boolean(expectedMismatchHints && expectedMismatchHints.length > 0);
        if (isCorrect && hasExpectedMismatch) {
          return isMultiGap
            ? renderCorrectAnswerRich()
            : renderCorrectAnswerPlain(expectedMismatchHints?.[0]?.expectedAnswer ?? "");
        }
        if (!isCorrect) {
          return isMultiGap
            ? renderCorrectAnswerRich()
            : renderCorrectAnswerPlain(question.gaps?.[0]?.correctAnswer ?? "");
        }
        return null;
      })()}
    </div>
  );

  if (type === ExerciseType.FILL_GAP_TEXT || type === ExerciseType.FILL_GAP_TEXT_MULTILINE) {
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
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
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
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
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
