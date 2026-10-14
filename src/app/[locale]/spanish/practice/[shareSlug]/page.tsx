import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getApiUrl } from "@/lib/api";
import { pageAlternates } from "@/lib/seo";
import { ExerciseSetResponse } from "@/app/types/api";
import PracticePage from "./PracticePage";

type Params = Promise<{ shareSlug: string; locale: string }>;

// "not-found" only for a definite 404, so a temporary API failure never noindexes a real page.
async function getSharedExercise(shareSlug: string): Promise<ExerciseSetResponse | "not-found" | null> {
  try {
    const res = await fetch(getApiUrl(`/api/exercise-sets/share/${shareSlug}`), {
      next: { revalidate: 3600 },
      // Metadata blocks the HTML response; don't let a slow API hold the page.
      signal: AbortSignal.timeout(3000),
    });
    if (res.status === 404) return "not-found";
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { shareSlug, locale } = await params;
  const exercise = await getSharedExercise(shareSlug);
  const alternates = pageAlternates(locale, `/spanish/practice/${shareSlug}`);

  if (exercise === "not-found") {
    return { robots: { index: false } };
  }
  if (!exercise) {
    return { alternates };
  }

  const t = await getTranslations({ locale, namespace: "Practice" });
  const description = t("metaDescription", {
    title: exercise.title,
    count: exercise.questions?.length ?? 0,
  });

  return {
    title: `${exercise.title} | Language Exercises`,
    description,
    alternates,
    openGraph: {
      title: exercise.title,
      description,
      url: alternates?.canonical as string,
      siteName: "Language Exercises",
      type: "website",
    },
  };
}

export default function Page({ params }: { params: Params }) {
  return <PracticePage params={params} />;
}
