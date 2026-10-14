import type { Metadata } from "next";
import { routing } from "@/routing";

export const BASE_URL = "https://language-exercises.com";

export function localizedUrl(locale: string, path: string = ""): string {
  return `${BASE_URL}/${locale}${path}`;
}

// Self-referencing canonical plus hreflang links for the same path in every locale.
// Each page must call this with its own path; never set a canonical in a shared layout.
export function pageAlternates(locale: string, path: string = ""): Metadata["alternates"] {
  return {
    canonical: localizedUrl(locale, path),
    languages: Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, path)])),
  };
}
