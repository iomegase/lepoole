import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lepoole-electric.fr'
  const [cities, services, projects] = await Promise.all([
    prisma.city.findMany({ where: { published: true } }),
    prisma.service.findMany({ where: { published: true } }),
    prisma.project.findMany({ where: { published: true } }),
  ])
  return [
    { url: base, priority: 1 },
    ...cities.map(c => ({ url: `${base}${c.isPrimary ? '/electricien-triel-sur-seine' : `/${c.slug}`}`, priority: c.isPrimary ? 1 : .8 })),
    ...services.map(s => ({ url: `${base}/services/${s.slug}`, priority: .8 })),
    ...projects.map(p => ({ url: `${base}/realisations/${p.slug}`, priority: .7 })),
  ]
}
