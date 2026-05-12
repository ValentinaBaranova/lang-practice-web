import ExercisesPage from "./teachers/[teacherId]/exercises/page";

export default function Home({params}: {params: Promise<{locale: string}>}) {
  const defaultTeacherId = "00000000-0000-0000-0000-000000000000";
  const exerciseParams = params.then(p => ({ teacherId: defaultTeacherId, locale: p.locale }));

  return (
    <div className="bg-[#F9F9FB] min-h-screen">
      <ExercisesPage params={exerciseParams} />
    </div>
  );
}
