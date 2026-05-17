import { Link } from "@/routing";
import { use } from "react";
import { ExerciseType } from "@/app/types/exercise";
import { useTranslations } from "next-intl";
import { Plus, BookOpen } from 'lucide-react';
import { ExerciseCard } from "./ExerciseCard";
import { getApiUrl } from "@/lib/api";

interface ExerciseSetResponse {
  id: string;
  teacherAccessCode: string;
  teacherName: string;
  title: string;
  type: ExerciseType;
  shareSlug: string;
  createdAt: string;
  questions?: { prompt: string }[];
}

async function getExercises(accessCode: string): Promise<ExerciseSetResponse[] | null> {
  const res = await fetch(getApiUrl(`/api/exercise-sets?accessCode=${accessCode}`), {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch exercises');
  }
  
  return res.json();
}

export default function ExercisesPage({
  params,
}: {
  params: Promise<{ accessCode: string; locale: string }>;
}) {
  const { accessCode } = use(params);
  const exercises = use(getExercises(accessCode));
  const t = useTranslations("TeacherExercises");

  if (exercises === null) {
    return (
      <div className="page-container">
        <div className="content-wrapper py-20 text-center">
          <div className="bg-red-50 text-red-600 rounded-2xl p-8 max-w-md mx-auto border border-red-100 shadow-sm">
            <h1 className="text-2xl font-bold mb-2">{t('teacherNotFound')}</h1>
            <p className="text-red-500/80 mb-6">{t('checkAccessCode')}</p>
            <Link href="/" className="btn-primary w-full justify-center">
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BookOpen className="w-8 h-8 text-indigo-500" />
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
            </div>
            <p className="text-slate-500 text-base">{t('description')}</p>
          </div>
            <Link
            href={`/teachers/${accessCode}/exercises/new`}
            className="w-full sm:w-auto btn-primary"
          >
            <Plus className="w-5 h-5" />
            {t('newPractice')}
          </Link>
        </div>
        
        {exercises.length === 0 ? (
          <div className="card p-12 text-center">
             <p className="text-slate-400 text-lg font-medium">{t('noExercises')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                accessCode={accessCode}
              />
            ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-center gap-3">
        <div className="text-indigo-200">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-[-15deg]">
            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-slate-400 font-medium">{t('footerDescription')}</p>
      </div>
    </div>
  </div>
  );
}
