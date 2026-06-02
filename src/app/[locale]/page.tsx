'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, ArrowRight, Send } from 'lucide-react';
import { ExerciseCard } from "./teachers/exercises/ExerciseCard";
import { fetchWithAuth } from "@/lib/api";
import { ExerciseSetResponse, PaginatedResponse } from "@/app/types/api";
import { Link } from "@/routing";
import { useAuth } from "@/components/AuthProvider";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import QuickPracticeSetup from "@/components/QuickPracticeSetup";

async function getPublicExercises(): Promise<PaginatedResponse<ExerciseSetResponse>> {
  const res = await fetchWithAuth(`/api/exercises/public`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch public exercises');
  }
  
  return res.json();
}

export default function Home() {
  const [exercises, setExercises] = useState<ExerciseSetResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const t = useTranslations("HomePage");
  const navT = useTranslations("Navigation");
  const { teacher, isLoading: authLoading } = useAuth();

  useEffect(() => {
    getPublicExercises()
      .then(res => setExercises(res.content))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // copyToClipboard and access code flow removed

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Hero Section */}
        <div className="text-center py-4 md:py-6 px-4">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight max-w-xl mx-auto">
            {t("title")}
          </h1>
          <p className="text-base text-slate-500 max-w-lg mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <QuickPracticeSetup />

        {/* Public Exercises */}
        <div className="mt-4 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            {t("publicExercises")}
          </h2>
          
          {isLoading ? (
            <div className="flex flex-col gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>
              ))}
            </div>
          ) : exercises.length === 0 ? (
            <div className="card p-12 text-center">
               <p className="text-slate-400 text-lg font-medium">{t("noExercises")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  isPublic={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sign in + Telegram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 opacity-90 scale-[0.98] origin-top">
          <div className="card p-5 flex flex-col items-start gap-3">
            <div className="bg-indigo-50 p-2.5 rounded-lg">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-0.5">
                {teacher ? t("createWorkspaceTitle") : t("signInTitle")}
              </h2>
              <p className="text-slate-500 text-xs mb-4">
                {teacher ? t("createWorkspaceDesc") : t("signInDesc")}
              </p>
            </div>
            <div className="w-full sm:w-auto mt-auto">
              {!authLoading && !teacher ? (
                <>
                  <div className="hidden sm:block">
                    <GoogleSignInButton />
                  </div>
                  <div className="sm:hidden w-full">
                    <Link
                      href="/login"
                      className="btn-primary w-full py-2 px-6 flex items-center justify-center gap-2"
                    >
                      {navT("signIn")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </>
              ) : teacher ? (
                <Link href="/teachers/exercises" className="btn-primary w-full sm:w-auto py-2 px-6 flex items-center justify-center gap-2">
                  {t("alreadyHaveCode")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="card p-5 flex flex-col items-start gap-3">
            <div className="bg-sky-50 p-2.5 rounded-lg">
              <Send className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-0.5">{t("telegramBot")}</h2>
              <p className="text-slate-500 text-xs mb-4">{t("telegramBotDesc")}</p>
            </div>
            <a 
              href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'lang_practice_bot'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto py-2 px-6 text-sm mt-auto"
            >
              {t("telegramBot")}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
