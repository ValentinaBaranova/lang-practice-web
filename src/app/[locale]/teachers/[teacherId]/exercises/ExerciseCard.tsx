'use client';

import { Link, useRouter } from "@/routing";
import { Link as LinkIcon, BarChart2, Edit3 } from 'lucide-react';

import { useTranslations } from "next-intl";

interface ExerciseCardProps {
  exercise: {
    id: string;
    title: string;
    type: string;
    shareSlug: string;
    createdAt: string;
    questions?: { prompt: string }[];
  };
  teacherId: string;
}

export function ExerciseCard({ exercise, teacherId }: ExerciseCardProps) {
  const t = useTranslations("TeacherExercises");
  const router = useRouter();

  const formatDistanceToNow = (date: Date) => {
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
  };

  const handleCardClick = () => {
    router.push(`/teachers/${teacherId}/exercises/${exercise.id}/edit`);
  };

  return (
    <div 
      className="card-interactive group"
      onClick={handleCardClick}
    >
      <div className="p-5 flex flex-col gap-3">
        {/* Top Row: Icon + Title + Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {exercise.id.includes('star') || exercise.title.toLowerCase().includes('article') ? (
                <div className="icon-box-amber">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ) : (
                <div className="icon-box-indigo">
                  <Edit3 className="w-5 h-5 text-indigo-500" />
                </div>
              )}
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 leading-tight tracking-tight">{exercise.title}</h3>
          </div>
          
          <div className="flex items-center gap-1">
            {exercise.shareSlug && (
              <Link
                href={`/practice/${exercise.shareSlug}`}
                target="_blank"
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <LinkIcon className="w-4 h-4" />
              </Link>
            )}
            <Link 
              href={`/teachers/${teacherId}/exercises/${exercise.id}/results`}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <BarChart2 className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Second Row: Type + Questions Count */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={
            (exercise.id.includes('star') || exercise.title.toLowerCase().includes('article')) 
                ? 'badge-amber' 
                : 'badge-primary'
          }>
            {exercise.type === 'FILL_GAP_TEXT' ? t('fillInGaps') : exercise.type}
          </span>
          <span className="text-slate-200 text-xs">•</span>
          <span className="text-slate-400 text-xs whitespace-nowrap">{t('questionsCount', { count: exercise.questions?.length || 0 })}</span>
        </div>

        {/* Third Row: Example Sentence */}
        <p className="text-slate-400 italic text-xs leading-relaxed">
          {exercise.questions && exercise.questions.length > 0 
            ? `"${exercise.questions[0].prompt}"`
            : `"${t('createFirstQuestion')}"`}
        </p>

        {/* Fourth Row: Created Date */}
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-normal">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
          {t('createdAgo', { time: formatDistanceToNow(new Date(exercise.createdAt)) })}
        </div>
      </div>
    </div>
  );
}
