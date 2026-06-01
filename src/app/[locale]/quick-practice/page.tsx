'use client';

import { useEffect, useState } from 'react';
import { useRouter, Link } from '@/routing';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import QuickPractice from '@/components/QuickPractice';
import { ExerciseType, Question } from '@/app/types/exercise';

export default function QuickPracticePage() {
  const router = useRouter();
  const t = useTranslations("Practice");
  const [exerciseData, setExerciseData] = useState<{
    title: string;
    type: ExerciseType;
    questions: Question[];
  } | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('quickPracticeExercise');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        Promise.resolve().then(() => setExerciseData(parsed));
      } catch (e) {
        console.error('Failed to parse exercise data', e);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  if (!exerciseData) {
    return (
      <div className="page-container">
        <div className="page-content-narrow">
          <Link href="/" className="back-link">
            <ArrowLeft className="w-4 h-4" />
            {t("backToHome")}
          </Link>
          <div className="flex justify-center pt-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <QuickPractice
        title={exerciseData.title}
        type={exerciseData.type}
        questions={exerciseData.questions}
        onBack={() => {
          sessionStorage.removeItem('quickPracticeExercise');
          router.push('/');
        }}
      />
    </div>
  );
}
