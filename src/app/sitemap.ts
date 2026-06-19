import { MetadataRoute } from 'next'
import { routing } from '@/routing'
import { ExerciseSetResponse } from '@/app/types/api'

const locales = routing.locales
const BASE_URL = 'https://language-exercises.com'

function buildAlternates(path: string): Record<string, string> {
  return Object.fromEntries(locales.map((locale) => [locale, `${BASE_URL}/${locale}${path}`]))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const routes = ['']

  const staticSitemap: MetadataRoute.Sitemap = routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
      alternates: {
        languages: buildAlternates(route),
      },
    }))
  )

  // Try to fetch public exercises for dynamic routes
  let dynamicSitemap: MetadataRoute.Sitemap = []
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiUrl}/api/exercise-sets/public`, {
      next: { revalidate: 3600 }
    })

    if (res.ok) {
      const data = await res.json()
      const exercises: ExerciseSetResponse[] = data.content || []
      // Only include items that have a shareSlug; prefer updatedAt when available
      dynamicSitemap = exercises
        .filter((exercise) => Boolean(exercise.shareSlug))
        .flatMap((exercise) => {
          const path = `/spanish/practice/${exercise.shareSlug}`
          const lastModified = new Date(exercise.updatedAt || exercise.createdAt || new Date())
          return locales.map((locale) => ({
            url: `${BASE_URL}/${locale}${path}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
            alternates: {
              languages: buildAlternates(path),
            },
          }))
        })
    }
  } catch (e) {
    console.error('Sitemap generation: Could not fetch public exercises', e)
  }

  return [...staticSitemap, ...dynamicSitemap]
}
