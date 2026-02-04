import { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.donleo.app"
const locales = ["en", "es", "it", "fr", "de"] as const
const publicPaths = ["", "login", "signup", "privacy", "terms", "contact", "about"] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const path of publicPaths) {
      entries.push({
        url: path ? `${BASE_URL}/${locale}/${path}` : `${BASE_URL}/${locale}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.8,
      })
    }
  }

  return entries
}
