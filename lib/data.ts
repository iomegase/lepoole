import { prisma } from '@/lib/prisma'

export async function getSettings() {
  return prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  })
}

export async function getCities() {
  return prisma.city.findMany({ where: { published: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] })
}

export async function getServices() {
  return prisma.service.findMany({ where: { published: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] })
}

export async function getProjects(limit?: number) {
  return prisma.project.findMany({
    where: { published: true },
    include: { city: true, service: true },
    orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  })
}
