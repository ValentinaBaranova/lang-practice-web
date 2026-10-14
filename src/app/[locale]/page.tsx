import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageAlternates } from "@/lib/seo";
import HomePage from "./HomePage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return {
    title: `${t("title")} | Language Exercises`,
    description: t("subtitle"),
    alternates: pageAlternates(locale),
  };
}

export default function Page() {
  return <HomePage />;
}
