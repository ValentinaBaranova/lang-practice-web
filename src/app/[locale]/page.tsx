import {useTranslations} from 'next-intl';
import ExercisesPage from "./teachers/[teacherId]/exercises/page";

export default function Home({params}: {params: Promise<{locale: string}>}) {
  const t = useTranslations('HomePage');
  const defaultTeacherId = "00000000-0000-0000-0000-000000000000";
  const exerciseParams = Promise.resolve({ teacherId: defaultTeacherId });

  return (
    <div>
      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-gray-600">{t('description')}</p>
      </div>
      <ExercisesPage params={exerciseParams} />
    </div>
  );
}
