import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = await prisma.project.findUnique({ where: { slug }, include: { city: true, service: true } })
  if (!project) return {}
  return {
    title: `${project.title} — ${project.city.name}`,
    description: `${project.problem.slice(0, 110)} Intervention Le Poole Electric à ${project.city.name}.`,
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await prisma.project.findUnique({ where: { slug }, include: { city: true, service: true } })
  if (!project || !project.published) notFound()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: project.title,
    about: project.service?.name,
    contentLocation: project.city.name,
    datePublished: (project.completedAt || project.createdAt).toISOString(),
    author: { '@type': 'Organization', name: 'Le Poole Electric' },
  }

  return <main className="container py-16">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <div className="max-w-5xl"><p className="font-bold">{project.city.name}{project.service ? ` · ${project.service.name}` : ''}</p><h1 className="mt-3 max-w-4xl text-5xl font-black tracking-tight">{project.title}</h1>
      {(project.beforeImage || project.afterImage) && <div className="mt-10 grid gap-4 md:grid-cols-2">{project.beforeImage && <figure><div className="aspect-[4/3] overflow-hidden rounded-3xl bg-black/5"><img className="h-full w-full object-cover" src={project.beforeImage} alt={`Avant les travaux — ${project.title}`} /></div><figcaption className="mt-2 text-sm font-bold">Avant</figcaption></figure>}{project.afterImage && <figure><div className="aspect-[4/3] overflow-hidden rounded-3xl bg-black/5"><img className="h-full w-full object-cover" src={project.afterImage} alt={`Après les travaux — ${project.title}`} /></div><figcaption className="mt-2 text-sm font-bold">Après</figcaption></figure>}</div>}
      <div className="mt-12 grid gap-4 md:grid-cols-3"><div className="card"><h2 className="font-black">Problématique</h2><p className="mt-3 leading-7 text-black/65">{project.problem}</p></div><div className="card"><h2 className="font-black">Travaux effectués</h2><p className="mt-3 leading-7 text-black/65">{project.workDone}</p></div><div className="card"><h2 className="font-black">Résultat</h2><p className="mt-3 leading-7 text-black/65">{project.result}</p></div></div>
    </div>
  </main>
}
