import Link from 'next/link'
import { getServices } from '@/lib/data'

export async function ServiceGrid() {
  const services = await getServices()
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map(s => (
    <Link className="card transition hover:-translate-y-1" key={s.id} href={`/services/${s.slug}`}>
      <div className="text-xl font-black">{s.name}</div>
      <p className="mt-3 text-black/65">{s.excerpt}</p>
      <div className="mt-6 font-bold">Voir le service →</div>
    </Link>
  ))}</div>
}
