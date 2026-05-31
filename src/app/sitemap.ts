import { MetadataRoute } from 'next'
import { routing } from '@/routing'
import { ExerciseSetResponse } from '@/app/types/api'

const locales = routing.locales
const BASE_URL = 'https://language-exercises.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const routes = ['']
  
  const staticSitemap = locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  )

  // Try to fetch public exercises for dynamic routes
  let dynamicSitemap: MetadataRoute.Sitemap = []
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiUrl}/api/exercises/public`, { 
        next: { revalidate: 3600 }
    })
    
    if (res.ok) {
        const data = await res.json()
        const exercises = data.content || []
        dynamicSitemap = locales.flatMap((locale) =>
            exercises.map((exercise: ExerciseSetResponse) => ({
                url: `${BASE_URL}/${locale}/spanish/practice/${exercise.shareSlug}`,
                lastModified: new Date(exercise.createdAt || new Date()),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }))
        )
    }
  } catch (e) {
    console.error('Sitemap generation: Could not fetch public exercises', e)
  }

  return [...staticSitemap, ...dynamicSitemap]
}
