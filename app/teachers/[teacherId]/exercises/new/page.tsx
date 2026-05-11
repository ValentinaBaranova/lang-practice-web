"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ExerciseType } from "@/app/types/exercise";

export default function NewExercisePage({
  params,
}: {
  params: Promise<{ teacherId: string }>;
}) {
  const { teacherId } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const dto = {
      teacherId,
      title,
      type: ExerciseType.FILL_GAP_TEXT,
      questions: {
        text: "Please complete this sentence: The cat is on the ____.",
        answer: "mat"
      }
    };

    try {
      const response = await fetch("/api/exercise-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error("Failed to create exercise");
      }

      router.push(`/teachers/${teacherId}/exercises`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Exercise</h1>
      <p className="mb-6 text-gray-600">Teacher ID: {teacherId}</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Exercise Title
          </label>
          <input
            id="title"
            type="text"
            required
            className="border border-gray-300 p-2 w-full rounded-md"
            placeholder="e.g. Present Simple Practice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:bg-blue-300"
          >
            {isSubmitting ? "Creating..." : "Create Exercise"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
