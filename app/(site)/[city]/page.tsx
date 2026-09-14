import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ServiceGrid } from '@/components/service-grid'

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params
  const city = await prisma.city.findUnique({ where: { slug } })
  return city ? { title: city.title, description: city.intro } : {}
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params
  const city = await prisma.city.findUnique({ where: { slug } })
  if (!city || city.isPrimary || !city.published) notFound()
  return <main className="container py-16"><div className="max-w-4xl"><p className="font-bold">Zone d’intervention</p><h1 className="mt-3 text-5xl font-black tracking-tight">{city.title}</h1><p className="mt-6 text-xl leading-8 text-black/65">{city.intro}</p><div className="mt-10 whitespace-pre-line leading-8">{city.content}</div></div><div className="mt-16"><ServiceGrid /></div></main>
}
