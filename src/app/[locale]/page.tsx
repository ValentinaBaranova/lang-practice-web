import { use } from "react";
import { useTranslations } from "next-intl";
import { BookOpen } from 'lucide-react';
import { ExerciseCard } from "./teachers/[teacherId]/exercises/ExerciseCard";
import { getApiUrl } from "@/lib/api";
import { ExerciseType } from "@/app/types/exercise";

interface ExerciseSetResponse {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  type: ExerciseType;
  shareSlug: string;
  createdAt: string;
  questions?: { prompt: string }[];
}

async function getPublicExercises(): Promise<ExerciseSetResponse[]> {
  const res = await fetch(getApiUrl(`/api/exercise-sets/public`), {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch public exercises');
  }
  
  return res.json();
}

export default function Home({params}: {params: Promise<{locale: string}>}) {
  const { locale } = use(params);
  const exercises = use(getPublicExercises());
  const t = useTranslations("HomePage");

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BookOpen className="w-8 h-8 text-indigo-500" />
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t("title")}</h1>
            </div>
            <p className="text-slate-500 text-base">{t("description")}</p>
          </div>
        </div>
        
        {exercises.length === 0 ? (
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
  </div>
  );
}
