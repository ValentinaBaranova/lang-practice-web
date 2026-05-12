"use client";

import { use, useState, useEffect } from "react";
import { Link } from "@/routing";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

interface AttemptResponse {
  id: string;
  exerciseSetId: string;
  studentName: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
}

interface ExerciseSetResponse {
  id: string;
  title: string;
  type: string;
}

export default function ResultsPage({
  params,
}: {
  params: Promise<{ accessCode: string; exerciseSetId: string; locale: string }>;
}) {
  const { accessCode, exerciseSetId } = use(params);
  const t = useTranslations("Results");
  const tEdit = useTranslations("EditExercise");

  const [attempts, setAttempts] = useState<AttemptResponse[]>([]);
  const [exerciseSet, setExerciseSet] = useState<ExerciseSetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attemptsRes, exerciseRes] = await Promise.all([
          fetch(`/api/attempts/exercise-set/${exerciseSetId}`),
          fetch(`/api/exercise-sets/${exerciseSetId}`)
        ]);

        if (!attemptsRes.ok || !exerciseRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [attemptsData, exerciseData] = await Promise.all([
          attemptsRes.json(),
          exerciseRes.json()
        ]);

        setAttempts(attemptsData);
        setExerciseSet(exerciseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [exerciseSetId]);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-wrapper flex justify-center pt-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <div className="card border-red-100 p-8">
            <p className="text-red-600 mb-4 font-medium">{error}</p>
            <Link
              href={`/teachers/${accessCode}/exercises`}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              {tEdit("back")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper pb-12">
        <Link
          href={`/teachers/${accessCode}/exercises`}
          className="back-link"
        >
          <ArrowLeft className="w-4 h-4" />
          {tEdit("back")}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {exerciseSet?.title} - {t("title")}
          </h1>
          <p className="text-slate-500">{t("subtitle")}</p>
        </div>

        {attempts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-400 text-lg font-medium">
              {t("noAttempts")}
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t("studentName")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t("progress")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t("score")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t("accuracy")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {attempts.map((attempt) => {
                    const accuracy =
                      attempt.answeredQuestions > 0
                        ? Math.round(
                            (attempt.correctAnswers /
                              attempt.answeredQuestions) *
                              100
                          )
                        : 0;

                    return (
                      <tr key={attempt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                          {attempt.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {attempt.answeredQuestions} / {attempt.totalQuestions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {attempt.correctAnswers} / {attempt.answeredQuestions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                          {accuracy}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
