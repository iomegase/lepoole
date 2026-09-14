import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MarkdownContent } from '@/components/markdown-content'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = await prisma.service.findUnique({ where: { slug } })
  return service ? { title: service.title, description: service.excerpt } : {}
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await prisma.service.findUnique({ where: { slug }, include: { projects: { where: { published: true }, include: { city: true } } } })
  if (!service || !service.published) notFound()
  return <main className="container py-16"><div className="max-w-4xl"><p className="font-bold">Service</p><h1 className="mt-3 text-5xl font-black tracking-tight">{service.title}</h1><p className="mt-6 text-xl leading-8 text-black/65">{service.excerpt}</p><div className="mt-10"><MarkdownContent content={service.content} /></div></div>{service.projects.length > 0 && <section className="mt-16"><h2 className="text-3xl font-black">Réalisations liées</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{service.projects.map(p => <a className="card" key={p.id} href={`/realisations/${p.slug}`}><div className="font-bold">{p.city.name}</div><div className="mt-2 text-xl font-black">{p.title}</div></a>)}</div></section>}</main>
}
