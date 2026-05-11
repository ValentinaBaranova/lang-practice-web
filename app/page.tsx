import ExercisesPage from "./teachers/[teacherId]/exercises/page";

export default async function Home() {
  const defaultTeacherId = "00000000-0000-0000-0000-000000000000";
  const params = Promise.resolve({ teacherId: defaultTeacherId });

  return <ExercisesPage params={params} />;
}
