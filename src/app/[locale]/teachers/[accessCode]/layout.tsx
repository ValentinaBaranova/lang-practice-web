import { getApiUrl } from "@/lib/api";
import { TeacherResponse } from "@/app/types/api";
import TeacherNameSaver from "./TeacherNameSaver";
import { Link } from "@/routing";
import { getTranslations } from "next-intl/server";

async function getTeacher(accessCode: string): Promise<TeacherResponse | null> {
  const res = await fetch(getApiUrl(`/api/teachers/${accessCode}`), {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch teacher');
  }
  
  return res.json();
}

export default async function TeacherLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ accessCode: string; locale: string }>;
}) {
  const { accessCode } = await params;
  const teacher = await getTeacher(accessCode);
  const t = await getTranslations("TeacherExercises");

  if (!teacher) {
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
    <>
      <TeacherNameSaver name={teacher.name} />
      {children}
    </>
  );
}
