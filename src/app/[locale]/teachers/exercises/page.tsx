"use client";

import { Link } from "@/routing";
import { use, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseSetResponse, PaginatedResponse } from "@/app/types/api";
import { fetchWithAuth } from "@/lib/api";

export default function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = use(searchParams);
  const currentPage = parseInt(page || '0', 10);
  const [response, setResponse] = useState<PaginatedResponse<ExerciseSetResponse>>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: currentPage
  });
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("TeacherExercises");

  useEffect(() => {
    async function fetchExercises() {
      setIsLoading(true);
      try {
        const res = await fetchWithAuth(`/api/exercise-sets?page=${currentPage}&size=10`);
        if (!res.ok) {
          console.error(`Failed to fetch exercises: ${res.status} ${res.statusText}`);
          setResponse({ content: [], totalPages: 0, totalElements: 0, size: 10, number: currentPage });
        } else {
          const data = await res.json();
          setResponse(data);
        }
      } catch (error) {
        console.error('Error in getExercises:', error);
        setResponse({ content: [], totalPages: 0, totalElements: 0, size: 10, number: currentPage });
      } finally {
        setIsLoading(false);
      }
    }
    fetchExercises();
  }, [currentPage]);

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
            href={`/teachers/exercises/new`}
            className="w-full sm:w-auto btn-primary"
          >
            <Plus className="w-5 h-5" />
            {t('newPractice')}
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : response.content.length === 0 ? (
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
                />
              ))}
            </div>
            {response.totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <Link
                  href={`/teachers/exercises?page=${currentPage - 1}`}
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
                      href={`/teachers/exercises?page=${i}`}
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
                  href={`/teachers/exercises?page=${currentPage + 1}`}
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
