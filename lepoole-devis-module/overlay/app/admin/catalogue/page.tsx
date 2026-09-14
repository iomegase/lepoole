import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createServiceCatalogAction, toggleServiceCatalogAction, updateServiceCatalogAction } from './actions'

const field = 'mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 outline-none focus:border-black/40'
const units = [
  ['UNIT', 'unité'], ['HOUR', 'heure'], ['METER', 'mètre'], ['M2', 'm²'], ['FORFAIT', 'forfait'], ['DAY', 'jour'],
] as const
const contexts = [
  ['taxNew', 'Construction neuve', 'NEW_CONSTRUCTION'],
  ['taxRenovation', 'Rénovation logement > 2 ans', 'RENOVATION_OVER_2_YEARS'],
  ['taxRecent', 'Logement < 2 ans', 'RENOVATION_UNDER_2_YEARS'],
  ['taxEnergy', 'Rénovation énergétique', 'ENERGY_RENOVATION'],
  ['taxOther', 'Autre / taux normal', 'OTHER'],
] as const

export default async function CataloguePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  if (!(await isAdmin())) redirect('/admin/login')
  const { saved } = await searchParams
  const services = await prisma.serviceCatalog.findMany({ include: { taxRules: true }, orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }] })

  const rate = (service: typeof services[number], context: string, fallback: number) =>
    Number(service.taxRules.find((rule) => rule.context === context)?.taxRate ?? fallback)

  return <main className="min-h-screen bg-[#eef0f2] p-4 md:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Administration</div>
          <h1 className="mt-1 text-3xl font-black">Catalogue tarifaire</h1>
          <p className="mt-2 max-w-2xl text-sm text-black/55">Prix HT et règles de TVA proposés lors de la création d’un devis. Chaque devis conserve ensuite ses valeurs historiques.</p>
        </div>
        <div className="flex gap-2"><Link href="/admin" className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold">Administration</Link><Link href="/admin/devis" className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white">Devis</Link></div>
      </div>

      {saved && <div className="mt-6 rounded-2xl bg-emerald-100 px-5 py-4 text-sm font-bold text-emerald-900">Catalogue enregistré.</div>}

      <section className="mt-8 rounded-3xl bg-white p-6">
        <div className="mb-5"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Nouvelle prestation</div><h2 className="mt-1 text-xl font-black">Ajouter au catalogue</h2></div>
        <form action={createServiceCatalogAction} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-bold md:col-span-2">Nom<input name="name" required className={field} placeholder="Main-d’œuvre électricien" /></label>
          <label className="text-sm font-bold">Catégorie<input name="category" className={field} placeholder="Main-d’œuvre" /></label>
          <label className="text-sm font-bold">Unité<select name="unit" className={field}>{units.map(([value, name]) => <option value={value} key={value}>{name}</option>)}</select></label>
          <label className="text-sm font-bold">Prix client HT<input name="unitPriceHT" type="number" min="0" step="0.01" required className={field} /></label>
          <label className="text-sm font-bold">Coût fournisseur HT<input name="costPriceHT" type="number" min="0" step="0.01" className={field} /></label>
          <label className="text-sm font-bold">Ordre<input name="sortOrder" type="number" defaultValue="0" className={field} /></label>
          <label className="text-sm font-bold md:col-span-2 lg:col-span-4">Description<textarea name="description" className={`${field} min-h-24`} /></label>
          <div className="md:col-span-2 lg:col-span-4 grid gap-3 rounded-2xl bg-[#f6f3ec] p-4 md:grid-cols-5">
            {contexts.map(([name, title], index) => <label key={name} className="text-xs font-bold">{title}<input name={name} type="number" min="0" max="100" step="0.1" defaultValue={[20, 10, 20, 20, 20][index]} className={field} /></label>)}
          </div>
          <p className="text-xs leading-5 text-black/45 md:col-span-2 lg:col-span-4">Les taux sont des valeurs proposées. Stan reste responsable du taux effectivement retenu sur chaque ligne du devis.</p>
          <button className="rounded-xl bg-[#f4c542] px-4 py-3 font-black md:col-span-2 lg:col-span-4">Ajouter la prestation</button>
        </form>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6">
        <div className="mb-5 flex items-end justify-between"><div><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Prestations</div><h2 className="mt-1 text-xl font-black">{services.length} élément{services.length > 1 ? 's' : ''}</h2></div></div>
        <div className="grid gap-4">{services.length === 0 ? <p className="text-black/50">Le catalogue est vide.</p> : services.map((service) => <details key={service.id} className={`rounded-2xl border p-4 ${service.active ? 'border-black/10' : 'border-black/5 bg-black/[0.025] opacity-65'}`}>
          <summary className="cursor-pointer list-none"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="font-black">{service.name}</span><span className="ml-2 text-sm text-black/45">{service.category || 'Sans catégorie'} · {Number(service.unitPriceHT).toFixed(2)} € HT</span></div><span className="rounded-full bg-black/[0.05] px-3 py-1 text-xs font-bold">{service.active ? 'Actif' : 'Désactivé'}</span></div></summary>
          <form action={updateServiceCatalogAction} className="mt-5 grid gap-4 border-t border-black/10 pt-5 md:grid-cols-2 lg:grid-cols-4">
            <input type="hidden" name="id" value={service.id} />
            <label className="text-sm font-bold md:col-span-2">Nom<input name="name" required defaultValue={service.name} className={field} /></label>
            <label className="text-sm font-bold">Catégorie<input name="category" defaultValue={service.category ?? ''} className={field} /></label>
            <label className="text-sm font-bold">Unité<select name="unit" defaultValue={service.unit} className={field}>{units.map(([value, name]) => <option value={value} key={value}>{name}</option>)}</select></label>
            <label className="text-sm font-bold">Prix client HT<input name="unitPriceHT" type="number" min="0" step="0.01" defaultValue={Number(service.unitPriceHT)} className={field} /></label>
            <label className="text-sm font-bold">Coût fournisseur HT<input name="costPriceHT" type="number" min="0" step="0.01" defaultValue={service.costPriceHT == null ? '' : Number(service.costPriceHT)} className={field} /></label>
            <label className="text-sm font-bold">Ordre<input name="sortOrder" type="number" defaultValue={service.sortOrder} className={field} /></label>
            <label className="text-sm font-bold md:col-span-2 lg:col-span-4">Description<textarea name="description" defaultValue={service.description ?? ''} className={`${field} min-h-24`} /></label>
            <div className="md:col-span-2 lg:col-span-4 grid gap-3 rounded-2xl bg-[#f6f3ec] p-4 md:grid-cols-5">
              {contexts.map(([name, title, context], index) => <label key={name} className="text-xs font-bold">{title}<input name={name} type="number" min="0" max="100" step="0.1" defaultValue={rate(service, context, [20, 10, 20, 20, 20][index])} className={field} /></label>)}
            </div>
            <button className="rounded-xl bg-black px-4 py-3 font-bold text-white md:col-span-2 lg:col-span-4">Enregistrer</button>
          </form>
          <form action={toggleServiceCatalogAction} className="mt-3"><input type="hidden" name="id" value={service.id} /><button className="rounded-full border border-black/15 px-4 py-2 text-sm font-bold">{service.active ? 'Désactiver' : 'Réactiver'}</button></form>
        </details>)}</div>
      </section>
    </div>
  </main>
}
