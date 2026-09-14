import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createProjectAction,
  deleteProjectAction,
  logoutAction,
  toggleProjectAction,
  updateCityAction,
  updateProjectAction,
  updateServiceAction,
  updateSettingsAction,
} from './actions'

const field = 'mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 outline-none focus:border-black/40'
const area = `${field} min-h-28`

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  if (!(await isAdmin())) redirect('/admin/login')
  const { saved } = await searchParams
  const [settings, cities, services, projects] = await Promise.all([
    prisma.siteSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    prisma.city.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.service.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.project.findMany({ include: { city: true, service: true }, orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }] }),
  ])

  return <main className="min-h-screen bg-[#eef0f2] p-4 md:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><div className="text-sm font-bold text-black/45">LE POOLE ELECTRIC</div><h1 className="text-3xl font-black">Administration</h1><p className="mt-1 text-sm text-black/55">Contenu public, SEO local et réalisations.</p></div>
        <div className="flex gap-2"><a href="/" className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold">Voir le site</a><form action={logoutAction}><button className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white">Déconnexion</button></form></div>
      </div>

      {saved && <div className="mt-6 rounded-2xl bg-emerald-100 px-5 py-4 text-sm font-bold text-emerald-900">Modification enregistrée.</div>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <section className="rounded-3xl bg-white p-6">
          <div className="mb-5"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Identité</div><h2 className="mt-1 text-xl font-black">Informations générales</h2></div>
          <form action={updateSettingsAction} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold">Entreprise<input name="companyName" defaultValue={settings.companyName} className={field} /></label>
              <label className="text-sm font-bold">Nom de l’artisan<input name="founderName" defaultValue={settings.founderName} className={field} /></label>
            </div>
            <label className="text-sm font-bold">Titre principal<input name="heroTitle" defaultValue={settings.heroTitle} className={field} /></label>
            <label className="text-sm font-bold">Sous-titre<textarea name="heroSubtitle" defaultValue={settings.heroSubtitle} className={area} /></label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold">Téléphone<input name="phone" defaultValue={settings.phone ?? ''} className={field} /></label>
              <label className="text-sm font-bold">Email<input name="email" defaultValue={settings.email ?? ''} className={field} /></label>
              <label className="text-sm font-bold md:col-span-2">Adresse<input name="address" defaultValue={settings.address ?? ''} className={field} /></label>
              <label className="text-sm font-bold">Année de création<input name="foundedYear" type="number" defaultValue={settings.foundedYear} className={field} /></label>
              <label className="text-sm font-bold">Note Google<input name="googleRating" type="number" min="0" max="5" step="0.1" defaultValue={settings.googleRating ?? ''} className={field} /></label>
              <label className="text-sm font-bold">Nombre d’avis Google<input name="googleReviewCount" type="number" min="0" defaultValue={settings.googleReviewCount} className={field} /></label>
              <label className="text-sm font-bold">Lien pour déposer un avis<input name="googleReviewUrl" defaultValue={settings.googleReviewUrl ?? ''} className={field} /></label>
            </div>
            <button className="rounded-xl bg-[#f4c542] px-4 py-3 font-black">Enregistrer</button>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6">
          <div className="mb-5"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">SEO local</div><h2 className="mt-1 text-xl font-black">Ajouter une réalisation</h2><p className="mt-1 text-sm text-black/55">Le contenu le plus utile pour renforcer une ville + un service.</p></div>
          <form action={createProjectAction} className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold md:col-span-2">Titre<input name="title" required className={field} placeholder="Remplacement d’un tableau électrique ancien" /></label>
            <label className="text-sm font-bold md:col-span-2">Slug <span className="font-normal text-black/45">(facultatif)</span><input name="slug" className={field} placeholder="tableau-electrique-triel-centre" /></label>
            <label className="text-sm font-bold">Ville<select name="cityId" required className={field}>{cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className="text-sm font-bold">Service<select name="serviceId" className={field}><option value="">—</option>{services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label className="text-sm font-bold">Date de fin<input name="completedAt" type="date" className={field} /></label><div />
            <label className="text-sm font-bold md:col-span-2">Problématique<textarea name="problem" required className={area} /></label>
            <label className="text-sm font-bold md:col-span-2">Travaux effectués<textarea name="workDone" required className={area} /></label>
            <label className="text-sm font-bold md:col-span-2">Résultat<textarea name="result" required className={area} /></label>
            <label className="text-sm font-bold">Photo avant (URL)<input name="beforeImage" type="url" className={field} /></label>
            <label className="text-sm font-bold">Photo après (URL)<input name="afterImage" type="url" className={field} /></label>
            <button className="rounded-xl bg-black px-4 py-3 font-bold text-white md:col-span-2">Publier la réalisation</button>
          </form>
        </section>
      </div>

      <section className="mt-6 rounded-3xl bg-white p-6">
        <div className="mb-5"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Pages locales</div><h2 className="mt-1 text-xl font-black">Villes</h2></div>
        <div className="grid gap-4 lg:grid-cols-2">{cities.map(city => <details key={city.id} className="rounded-2xl border border-black/10 p-4" open={city.isPrimary}>
          <summary className="cursor-pointer font-black">{city.name}{city.isPrimary ? ' · page principale' : ''}</summary>
          <form action={updateCityAction} className="mt-4 grid gap-3">
            <input type="hidden" name="id" value={city.id} />
            <label className="text-sm font-bold">Titre SEO / H1<input name="title" defaultValue={city.title} className={field} /></label>
            <label className="text-sm font-bold">Introduction<textarea name="intro" defaultValue={city.intro} className={area} /></label>
            <label className="text-sm font-bold">Contenu<textarea name="content" defaultValue={city.content} className={`${area} min-h-52`} /></label>
            <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="published" defaultChecked={city.published} /> Page publiée</label>
            <button className="rounded-xl border border-black/15 px-4 py-2 font-bold">Enregistrer {city.name}</button>
          </form>
        </details>)}</div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6">
        <div className="mb-5"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Pages métiers</div><h2 className="mt-1 text-xl font-black">Services</h2></div>
        <div className="grid gap-4 lg:grid-cols-2">{services.map(service => <details key={service.id} className="rounded-2xl border border-black/10 p-4">
          <summary className="cursor-pointer font-black">{service.name}</summary>
          <form action={updateServiceAction} className="mt-4 grid gap-3">
            <input type="hidden" name="id" value={service.id} />
            <label className="text-sm font-bold">Titre SEO / H1<input name="title" defaultValue={service.title} className={field} /></label>
            <label className="text-sm font-bold">Résumé<textarea name="excerpt" defaultValue={service.excerpt} className={area} /></label>
            <label className="text-sm font-bold">Contenu<textarea name="content" defaultValue={service.content} className={`${area} min-h-52`} /></label>
            <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="published" defaultChecked={service.published} /> Page publiée</label>
            <button className="rounded-xl border border-black/15 px-4 py-2 font-bold">Enregistrer {service.name}</button>
          </form>
        </details>)}</div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6">
        <div className="mb-5"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Portfolio local</div><h2 className="mt-1 text-xl font-black">Réalisations</h2></div>
        <div className="grid gap-4">{projects.length === 0 ? <p className="text-black/50">Aucune réalisation pour le moment.</p> : projects.map(p => <details key={p.id} className="rounded-2xl border border-black/10 p-4">
          <summary className="cursor-pointer"><span className="font-black">{p.title}</span><span className="ml-2 text-sm text-black/45">{p.city.name}{p.service ? ` · ${p.service.name}` : ''} · {p.published ? 'Publié' : 'Masqué'}</span></summary>
          <form action={updateProjectAction} className="mt-4 grid gap-3 md:grid-cols-2">
            <input type="hidden" name="id" value={p.id} />
            <label className="text-sm font-bold md:col-span-2">Titre<input name="title" defaultValue={p.title} className={field} /></label>
            <label className="text-sm font-bold md:col-span-2">Slug<input name="slug" defaultValue={p.slug} className={field} /></label>
            <label className="text-sm font-bold">Ville<select name="cityId" defaultValue={p.cityId} className={field}>{cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className="text-sm font-bold">Service<select name="serviceId" defaultValue={p.serviceId ?? ''} className={field}><option value="">—</option>{services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label className="text-sm font-bold md:col-span-2">Problématique<textarea name="problem" defaultValue={p.problem} className={area} /></label>
            <label className="text-sm font-bold md:col-span-2">Travaux<textarea name="workDone" defaultValue={p.workDone} className={area} /></label>
            <label className="text-sm font-bold md:col-span-2">Résultat<textarea name="result" defaultValue={p.result} className={area} /></label>
            <label className="text-sm font-bold">Photo avant<input name="beforeImage" type="url" defaultValue={p.beforeImage ?? ''} className={field} /></label>
            <label className="text-sm font-bold">Photo après<input name="afterImage" type="url" defaultValue={p.afterImage ?? ''} className={field} /></label>
            <label className="flex items-center gap-2 text-sm font-bold md:col-span-2"><input type="checkbox" name="published" defaultChecked={p.published} /> Réalisation publiée</label>
            <button className="rounded-xl bg-black px-4 py-3 font-bold text-white md:col-span-2">Enregistrer la réalisation</button>
          </form>
          <div className="mt-3 flex gap-2"><form action={toggleProjectAction}><input type="hidden" name="id" value={p.id} /><button className="rounded-full border px-4 py-2 text-sm font-bold">{p.published ? 'Masquer' : 'Publier'}</button></form><form action={deleteProjectAction}><input type="hidden" name="id" value={p.id} /><button className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700">Supprimer</button></form></div>
        </details>)}</div>
      </section>
    </div>
  </main>
}
