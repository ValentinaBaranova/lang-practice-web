"use client";

import { use, useState, useEffect } from "react";
import { Link } from "@/routing";
import { useTranslations } from "next-intl";

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
  params: Promise<{ teacherId: string; exerciseSetId: string; locale: string }>;
}) {
  const { teacherId, exerciseSetId } = use(params);
  const t = useTranslations("Practice");

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
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href={`/teachers/${teacherId}/exercises`} className="text-blue-600 hover:underline">
          Back to Exercises
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/teachers/${teacherId}/exercises`} className="text-blue-600 hover:underline mb-2 inline-block">
          &larr; Back to Exercises
        </Link>
        <h1 className="text-2xl font-bold">{exerciseSet?.title} - Results</h1>
        <p className="text-gray-500">View student performance for this exercise set.</p>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No attempts yet. Share the link with your students to see results here!</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attempts.map((attempt) => {
                const accuracy = attempt.answeredQuestions > 0 
                  ? Math.round((attempt.correctAnswers / attempt.answeredQuestions) * 100) 
                  : 0;
                
                return (
                  <tr key={attempt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {attempt.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attempt.answeredQuestions} / {attempt.totalQuestions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attempt.correctAnswers} / {attempt.answeredQuestions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">{accuracy}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${accuracy >= 80 ? 'bg-green-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
