'use client';

import { Link, useRouter } from "@/routing";
import { Link as LinkIcon, BarChart2 } from 'lucide-react';

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
  accessCode?: string;
  isPublic?: boolean;
}

export function ExerciseCard({ exercise, accessCode, isPublic = false }: ExerciseCardProps) {
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
    if (isPublic) {
      router.push(`/practice/${exercise.shareSlug}`);
    } else {
      router.push(`/teachers/${accessCode}/exercises/${exercise.id}/edit`);
    }
  };

  return (
    <div 
      className="card-interactive group"
      onClick={handleCardClick}
    >
      <div className="p-3.5 flex items-start gap-3.5">
        {/* Left Side: Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {exercise.id.includes('star') || exercise.title.toLowerCase().includes('article') ? (
            <div className="icon-box-indigo !bg-slate-50 border border-slate-100 !w-9 !h-9">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ) : (
            <div className="icon-box-indigo !bg-slate-50 border border-slate-100 !w-9 !h-9">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Center: Title + Metadata + Example */}
        <div className="flex-grow flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-base text-slate-900 leading-snug">{exercise.title}</h3>
            
            {!isPublic && (
              <div className="flex items-center gap-1 -mt-1">
                {exercise.shareSlug && (
                  <Link
                    href={`/practice/${exercise.shareSlug}`}
                    target="_blank"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </Link>
                )}
                <Link 
                  href={`/teachers/${accessCode}/exercises/${exercise.id}/results`}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Combined Metadata Row: Type + Questions Count + Created Date */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={
              (exercise.id.includes('star') || exercise.title.toLowerCase().includes('article')) 
                  ? 'badge-amber' 
                  : 'badge-primary'
            }>
              {exercise.type === 'FILL_GAP_TEXT' ? t('fillInGaps') : (exercise.type === 'MULTIPLE_CHOICE' ? t('multipleChoice') : exercise.type)}
            </span>
            <span className="text-slate-300 text-[10px]">•</span>
            <span className="text-slate-500 text-xs whitespace-nowrap font-medium">{t('questionsCount', { count: exercise.questions?.length || 0 })}</span>
            {!isPublic && (
              <>
                <span className="text-slate-300 text-[10px]">•</span>
                <span className="text-slate-500 text-xs whitespace-nowrap font-medium">
                  {t('createdAgo', { time: formatDistanceToNow(new Date(exercise.createdAt)) })}
                </span>
              </>
            )}
          </div>

          {/* Third Row: Example Sentence */}
          <p className="text-slate-400 italic text-xs leading-relaxed mt-0.5">
            {exercise.questions && exercise.questions.length > 0 
              ? `"${exercise.questions[0].prompt}"`
              : `"${t('createFirstQuestion')}"`}
          </p>
        </div>
      </div>
    </div>
  );
}
