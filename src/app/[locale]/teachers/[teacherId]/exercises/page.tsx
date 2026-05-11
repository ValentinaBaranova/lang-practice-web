import { Link } from "@/routing";
import { use } from "react";
import { ExerciseType } from "@/app/types/exercise";

interface ExerciseSetResponse {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  type: ExerciseType;
  createdAt: string;
}

async function getExercises(teacherId: string): Promise<ExerciseSetResponse[]> {
  // Use absolute URL for server-side fetching in Next.js if necessary, 
  // but usually for internal API calls in App Router, relative might work depending on config.
  // Since we have a rewrite in next.config.ts, and this is a Server Component,
  // we should be careful. However, 'use(params)' suggests this could be a client or server component.
  // If it's a server component (default in app dir), it runs on the server.
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
  const { teacherId, locale } = use(params);
  const exercises = use(getExercises(teacherId));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exercises for {exercises[0]?.teacherName || 'Teacher'}</h1>
        <Link
          href={`/teachers/${teacherId}/exercises/new`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Create New Exercise
        </Link>
      </div>
      
      {exercises.length === 0 ? (
        <p className="text-gray-500">No exercises found for this teacher.</p>
      ) : (
        <div className="grid gap-4">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{exercise.title}</h3>
                <p className="text-sm text-gray-500">Type: {exercise.type}</p>
                <p className="text-xs text-gray-400">Created: {new Date(exercise.createdAt).toLocaleDateString()}</p>
              </div>
              <Link 
                href={`/teachers/${teacherId}/exercises/${exercise.id}/edit`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
