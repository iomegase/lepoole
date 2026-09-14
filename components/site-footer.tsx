import Link from 'next/link'
import { getCities, getServices, getSettings } from '@/lib/data'

export async function SiteFooter() {
  const [cities, services, settings] = await Promise.all([getCities(), getServices(), getSettings()])
  return (
    <footer id="contact" className="mt-20 bg-[#101820] text-white">
      <div className="container grid gap-12 py-14 md:grid-cols-4">
        <div><div className="text-xl font-black">{settings.companyName}</div><p className="mt-3 text-white/70">Électricien à Triel-sur-Seine depuis {settings.foundedYear}.</p>{settings.phone && <a className="mt-5 inline-block font-bold" href={`tel:${settings.phone}`}>{settings.phone}</a>}{settings.email && <a className="mt-2 block text-sm text-white/70" href={`mailto:${settings.email}`}>{settings.email}</a>}</div>
        <div><h3 className="font-bold">Services</h3><div className="mt-3 grid gap-2 text-sm text-white/70">{services.slice(0, 6).map(s => <Link key={s.id} href={`/services/${s.slug}`}>{s.name}</Link>)}</div></div>
        <div><h3 className="font-bold">Villes</h3><div className="mt-3 grid gap-2 text-sm text-white/70">{cities.slice(0, 6).map(c => <Link key={c.id} href={c.isPrimary ? '/electricien-triel-sur-seine' : `/${c.slug}`}>{c.name}</Link>)}</div></div>
        <div><h3 className="font-bold">Confiance locale</h3><p className="mt-3 text-sm leading-6 text-white/70">Entreprise implantée localement depuis {settings.foundedYear}. Les réalisations publiées documentent les interventions par ville et spécialité.</p>{settings.googleReviewUrl && <a href={settings.googleReviewUrl} rel="noopener noreferrer" target="_blank" className="mt-5 inline-flex rounded-full bg-[#f4c542] px-4 py-2 text-sm font-black text-black">Donner un avis Google</a>}</div>
      </div>
    </footer>
  )
}
