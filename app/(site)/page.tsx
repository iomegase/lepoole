import { siteUrl } from '@/lib/site-url'
import Link from 'next/link'
import { getCities, getProjects, getSettings } from '@/lib/data'
import { ServiceGrid } from '@/components/service-grid'

export default async function HomePage() {
  const [settings, cities, projects] = await Promise.all([getSettings(), getCities(), getProjects(6)])
  const phone = settings.phone || process.env.NEXT_PUBLIC_PHONE || ''
  const years = Math.max(new Date().getFullYear() - settings.foundedYear, 0)
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'Electrician',
    name: settings.companyName,
    founder: settings.founderName,
    foundingDate: String(settings.foundedYear),
    url: siteUrl,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address: settings.address || undefined,
    areaServed: cities.map(city => city.name),
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <section className="border-b border-black/10">
        <div className="container grid min-h-[72vh] items-center gap-12 py-20 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold">Depuis {settings.foundedYear} · Triel-sur-Seine</div>
            <h1 className="max-w-4xl text-5xl font-black tracking-[-0.045em] md:text-7xl">{settings.heroTitle}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/65">{settings.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">{phone && <a className="btn btn-primary" href={`tel:${phone}`}>Dépannage / devis</a>}<Link className="btn border border-black/15 bg-white" href="#realisations">Voir les réalisations</Link></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold"><span>Artisan local</span><span>Intervention secteur Triel</span><span>Devis clair</span></div>
          </div>
          <div className="rounded-[32px] bg-[#101820] p-8 text-white md:p-10"><div className="text-sm uppercase tracking-[.2em] text-white/50">Pourquoi Le Poole Electric</div><div className="mt-5 text-4xl font-black">{years}+ ans d’ancrage local.</div><p className="mt-5 leading-7 text-white/70">Une entreprise implantée à Triel-sur-Seine depuis {settings.foundedYear}, avec des interventions documentées dans les communes voisines.</p><div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-5"><div className="text-3xl font-black">{settings.googleReviewCount}</div><div className="text-sm text-white/60">avis Google renseignés</div></div><div className="rounded-2xl bg-white/10 p-5"><div className="text-3xl font-black">{settings.googleRating ? `${settings.googleRating}/5` : '—'}</div><div className="text-sm text-white/60">note Google</div></div></div>{settings.googleReviewUrl && <a className="mt-4 inline-flex text-sm font-bold text-[#f4c542]" href={settings.googleReviewUrl} target="_blank" rel="noopener noreferrer">Déposer un avis →</a>}</div>
        </div>
      </section>

      <section id="services" className="container py-20"><div className="mb-10 max-w-2xl"><p className="font-bold">Services</p><h2 className="mt-2 text-4xl font-black tracking-tight">Électricité générale, rénovation et équipements connectés.</h2></div><ServiceGrid /></section>

      <section id="realisations" className="bg-white py-20"><div className="container"><div className="mb-10"><p className="font-bold">Réalisations locales</p><h2 className="mt-2 text-4xl font-black tracking-tight">Problème, intervention, résultat.</h2><p className="mt-3 max-w-2xl text-black/60">Chaque chantier publié renforce la preuve de proximité et permet de montrer concrètement le savoir-faire de l’entreprise.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{projects.length ? projects.map(p => <Link className="card transition hover:-translate-y-1" key={p.id} href={`/realisations/${p.slug}`}><div className="text-sm font-bold">{p.city.name}{p.service ? ` · ${p.service.name}` : ''}</div><div className="mt-3 text-2xl font-black">{p.title}</div><p className="mt-3 line-clamp-3 text-black/60">{p.problem}</p><div className="mt-6 font-bold">Voir le chantier →</div></Link>) : <div className="card md:col-span-2 lg:col-span-3"><div className="text-xl font-black">Les premières réalisations seront publiées ici.</div><p className="mt-2 text-black/60">Stan peut les ajouter directement depuis l’administration.</p></div>}</div></div></section>

      <section id="zone" className="container py-20"><div className="rounded-[32px] bg-[#f4c542] p-8 md:p-12"><p className="font-bold">Zone d’intervention</p><h2 className="mt-2 text-4xl font-black">Triel d’abord. Les communes voisines ensuite.</h2><div className="mt-8 flex flex-wrap gap-3">{cities.map(c => <Link key={c.id} className="rounded-full bg-white px-4 py-2 font-bold transition hover:-translate-y-0.5" href={c.isPrimary ? '/electricien-triel-sur-seine' : `/${c.slug}`}>{c.name}</Link>)}</div></div></section>
    </main>
  )
}
