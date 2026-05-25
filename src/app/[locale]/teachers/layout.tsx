'use client';

import { useAuth } from "@/components/AuthProvider";
import TeacherNameSaver from "./TeacherNameSaver";
import { useRouter } from "@/routing";
import { useEffect } from "react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { teacher, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !teacher) {
      router.push('/');
    }
  }, [isLoading, teacher, router]);

  if (isLoading || !teacher) {
    return (
      <div className="page-container">
        <div className="content-wrapper py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
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
