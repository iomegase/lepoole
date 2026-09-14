import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ServiceGrid } from '@/components/service-grid'

export const metadata: Metadata = {
  title: 'Électricien Triel-sur-Seine — dépannage et rénovation depuis 2002',
  description: 'Le Poole Electric, électricien à Triel-sur-Seine depuis 2002. Dépannage, tableau électrique, rénovation, domotique, interphone, alarme et réseau RJ45.',
}

export default async function TrielPage() {
  const city = await prisma.city.findFirst({ where: { isPrimary: true, published: true } })
  if (!city) notFound()
  return <main className="container py-16"><div className="max-w-4xl"><p className="font-bold">Le Poole Electric · {city.name}</p><h1 className="mt-3 text-5xl font-black tracking-tight md:text-6xl">{city.title}</h1><p className="mt-6 text-xl leading-8 text-black/65">{city.intro}</p><div className="prose mt-10 max-w-none whitespace-pre-line leading-8">{city.content}</div></div><div className="mt-16"><ServiceGrid /></div></main>
}
