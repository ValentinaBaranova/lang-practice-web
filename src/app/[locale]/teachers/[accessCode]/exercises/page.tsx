import { Link } from "@/routing";
import { use } from "react";
import { useTranslations } from "next-intl";
import { Plus, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExerciseCard } from "./ExerciseCard";
import { getApiUrl } from "@/lib/api";
import { ExerciseSetResponse, PaginatedResponse } from "@/app/types/api";

async function getExercises(accessCode: string, page: number = 0): Promise<PaginatedResponse<ExerciseSetResponse> | null> {
  const res = await fetch(getApiUrl(`/api/exercise-sets?accessCode=${accessCode}&page=${page}&size=10`), {
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
  searchParams,
}: {
  params: Promise<{ accessCode: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { accessCode } = use(params);
  const { page } = use(searchParams);
  const currentPage = parseInt(page || '0', 10);
  const response = use(getExercises(accessCode, currentPage));
  const t = useTranslations("TeacherExercises");

  if (response === null) {
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
        
        {response.content.length === 0 ? (
          <div className="card p-12 text-center">
             <p className="text-slate-400 text-lg font-medium">{t('noExercises')}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {response.content.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  accessCode={accessCode}
                />
              ))}
            </div>

            {response.totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <Link
                  href={`/teachers/${accessCode}/exercises?page=${currentPage - 1}`}
                  className={`p-2 rounded-lg border border-slate-200 transition-colors ${
                    currentPage === 0 
                      ? 'pointer-events-none opacity-50 bg-slate-50' 
                      : 'hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                  aria-disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                
                <div className="flex items-center gap-1">
                  {[...Array(response.totalPages)].map((_, i) => (
                    <Link
                      key={i}
                      href={`/teachers/${accessCode}/exercises?page=${i}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
                        currentPage === i
                          ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {i + 1}
                    </Link>
                  ))}
                </div>

                <Link
                  href={`/teachers/${accessCode}/exercises?page=${currentPage + 1}`}
                  className={`p-2 rounded-lg border border-slate-200 transition-colors ${
                    currentPage >= response.totalPages - 1 
                      ? 'pointer-events-none opacity-50 bg-slate-50' 
                      : 'hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                  aria-disabled={currentPage >= response.totalPages - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </>
      )}
    </div>
  </div>
  );
}
