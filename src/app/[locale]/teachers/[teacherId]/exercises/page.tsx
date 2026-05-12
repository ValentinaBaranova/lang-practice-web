import { Link } from "@/routing";
import { use } from "react";
import { ExerciseType } from "@/app/types/exercise";
import { useTranslations } from "next-intl";
import { Plus, Link as LinkIcon, BarChart2, Edit3, BookOpen } from 'lucide-react';

function formatDistanceToNow(date: Date, t: (key: string, values?: Record<string, string | number>) => string) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return t('time.justNow');
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return t('time.m', { count: diffInMinutes });
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return t('time.h', { count: diffInHours });
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return t('time.d', { count: diffInDays });
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return t('time.w', { count: diffInWeeks });
  const diffInMonths = Math.floor(diffInDays / 30);
  return t('time.mo', { count: diffInMonths });
}

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

async function getExercises(teacherId: string): Promise<ExerciseSetResponse[]> {
  const res = await fetch(`http://localhost:8080/api/exercise-sets?teacherId=${teacherId}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch exercises');
  }
  
  return res.json();
}

export default function ExercisesPage({
  params,
}: {
  params: Promise<{ teacherId: string; locale: string }>;
}) {
  const { teacherId } = use(params);
  const exercises = use(getExercises(teacherId));
  const t = useTranslations("TeacherExercises");

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BookOpen className="w-8 h-8 text-indigo-500" />
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
            </div>
            <p className="text-slate-500 text-base">{t('description')}</p>
          </div>
          <Link
            href={`/teachers/${teacherId}/exercises/new`}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-sm shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            {t('newPractice')}
          </Link>
        </div>
        
        {exercises.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
             <p className="text-slate-400 text-lg font-medium">{t('noExercises')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row transition-all hover:shadow-md overflow-hidden group">
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start flex-1">
                  <div className="flex-shrink-0">
                  {exercise.id.includes('star') || exercise.title.toLowerCase().includes('article') ? (
                    <div className="bg-amber-50 p-4 rounded-[1.25rem] group-hover:bg-amber-100 transition-colors w-20 h-20 flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="bg-indigo-50 p-4 rounded-[1.25rem] group-hover:bg-indigo-100 transition-colors w-20 h-20 flex items-center justify-center">
                      <Edit3 className="w-10 h-10 text-indigo-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-900 mb-2 leading-tight">{exercise.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      (exercise.id.includes('star') || exercise.title.toLowerCase().includes('article')) 
                          ? 'bg-amber-50 text-amber-600' 
                          : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {exercise.type === 'FILL_GAP_TEXT' ? t('fillInGaps') : exercise.type}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400 text-sm whitespace-nowrap">{t('questionsCount', { count: exercise.questions?.length || 0 })}</span>
                  </div>
                  <p className="text-slate-500 italic text-sm mb-4 leading-relaxed">
                    {exercise.questions && exercise.questions.length > 0 
                      ? `"${exercise.questions[0].prompt}"`
                      : `"${t('createFirstQuestion')}"`}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-500 text-sm">
                    <div className="flex items-center gap-1.5 font-medium">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                      {t('createdAgo', { time: formatDistanceToNow(new Date(exercise.createdAt), t) })}
                    </div>
                    <span className="hidden sm:inline text-slate-200">•</span>
                    <div className="flex items-center gap-1.5 font-medium">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                       {t('studentsCompleted', { count: exercise.title.toLowerCase().includes('shopping') ? 7 : exercise.title.toLowerCase().includes('article') ? 5 : 3 })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end border-t sm:border-t-0 border-slate-50 px-6 py-4 sm:px-8 bg-white sm:gap-4">
                {exercise.shareSlug && (
                  <Link
                    href={`/practice/${exercise.shareSlug}`}
                    target="_blank"
                    className="flex flex-col items-center gap-1.5 group/action"
                  >
                    <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-600 group-hover/action:bg-slate-50 group-hover/action:text-indigo-600 transition-colors">
                      <LinkIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-900">{t('shareLink')}</span>
                  </Link>
                )}
                <Link 
                  href={`/teachers/${teacherId}/exercises/${exercise.id}/results`}
                  className="flex flex-col items-center gap-1.5 group/action"
                >
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-600 group-hover/action:bg-slate-50 group-hover/action:text-indigo-600 transition-colors">
                    <BarChart2 className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-900">{t('results')}</span>
                </Link>
                <Link 
                  href={`/teachers/${teacherId}/exercises/${exercise.id}/edit`}
                  className="flex flex-col items-center gap-1.5 group/action"
                >
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-600 group-hover/action:bg-slate-50 group-hover/action:text-indigo-600 transition-colors">
                    <Edit3 className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-900">{t('edit')}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 flex items-center justify-center gap-3">
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
