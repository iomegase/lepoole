import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { siteUrl } from '@/lib/site-url'
import {
  addQuoteItemAction,
  applyQuoteTaxContextAction,
  deleteQuoteItemAction,
  markQuoteSentAction,
  updateQuoteItemAction,
  updateQuoteMetaAction,
} from '../actions'

const field = 'mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 outline-none focus:border-black/40'
const units = [['UNIT', 'unité'], ['HOUR', 'heure'], ['METER', 'mètre'], ['M2', 'm²'], ['FORFAIT', 'forfait'], ['DAY', 'jour']] as const
const contexts = [
  ['NEW_CONSTRUCTION', 'Construction neuve'],
  ['RENOVATION_OVER_2_YEARS', 'Rénovation logement > 2 ans'],
  ['RENOVATION_UNDER_2_YEARS', 'Logement < 2 ans'],
  ['ENERGY_RENOVATION', 'Rénovation énergétique'],
  ['OTHER', 'Autre / à vérifier'],
] as const
const statusLabels: Record<string, string> = { DRAFT: 'Brouillon', SENT: 'Envoyé', VIEWED: 'Consulté', ACCEPTED: 'Accepté', REJECTED: 'Refusé', EXPIRED: 'Expiré' }

function money(value: unknown) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value))
}

export default async function QuoteEditorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  if (!(await isAdmin())) redirect('/admin/login')
  const { id } = await params
  const { saved } = await searchParams
  const [quote, services] = await Promise.all([
    prisma.quote.findUnique({ where: { id }, include: { items: { orderBy: { position: 'asc' }, include: { service: true } }, request: true } }),
    prisma.serviceCatalog.findMany({ where: { active: true }, include: { taxRules: true }, orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }] }),
  ])
  if (!quote) notFound()

  const editable = quote.status === 'DRAFT'
  const publicUrl = `${siteUrl}/devis/${quote.token}`
  const estimatedCost = quote.items.reduce((sum, item) => sum + (item.costPriceHT ? Number(item.costPriceHT) * Number(item.quantity) : 0), 0)
  const margin = Number(quote.subtotalHT) - estimatedCost
  const marginRate = Number(quote.subtotalHT) > 0 ? margin / Number(quote.subtotalHT) * 100 : 0
  const taxGroups = new Map<number, { base: number; tax: number }>()
  for (const item of quote.items) {
    const rate = Number(item.taxRate)
    const current = taxGroups.get(rate) || { base: 0, tax: 0 }
    current.base += Number(item.totalHT)
    current.tax += Number(item.totalTax)
    taxGroups.set(rate, current)
  }

  return <main className="min-h-screen bg-[#eef0f2] p-4 md:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><Link href="/admin/devis" className="text-sm font-bold text-black/45">← Retour aux devis</Link><div className="mt-3 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-black">{quote.number}</h1><span className="rounded-full bg-white px-3 py-1 text-xs font-black">{statusLabels[quote.status]}</span></div><p className="mt-1 text-sm text-black/50">{quote.customerName} · {[quote.postalCode, quote.city].filter(Boolean).join(' ')}</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/admin/catalogue" className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold">Catalogue</Link>{quote.status !== 'DRAFT' && <a href={publicUrl} target="_blank" rel="noreferrer" className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white">Voir côté client</a>}</div>
      </div>

      {saved && <div className="mt-6 rounded-2xl bg-emerald-100 px-5 py-4 text-sm font-bold text-emerald-900">Modification enregistrée.</div>}
      {!editable && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-950">Ce devis a été envoyé : ses lignes et ses taux sont désormais figés. Pour une modification commerciale, créez une nouvelle version depuis la demande d’origine.</div>}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid content-start gap-6">
          <section className="rounded-3xl bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Client</div><h2 className="mt-1 text-xl font-black">{quote.customerName}</h2></div>{quote.request && <Link href={`/admin/devis/demandes/${quote.request.id}`} className="rounded-full border border-black/15 px-4 py-2 text-xs font-bold">Voir la demande {quote.request.number}</Link>}</div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-2xl bg-black/[0.035] p-4"><div className="text-xs text-black/40">Contact</div><div className="mt-1 font-bold">{quote.customerEmail}</div><div>{quote.customerPhone}</div></div><div className="rounded-2xl bg-black/[0.035] p-4"><div className="text-xs text-black/40">Chantier</div><div className="mt-1 font-bold">{quote.workAddress}</div><div>{[quote.postalCode, quote.city].filter(Boolean).join(' ')}</div></div></div>
          </section>

          {editable && <section className="rounded-3xl bg-white p-6">
            <div className="mb-5"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Ligne de devis</div><h2 className="mt-1 text-xl font-black">Ajouter une prestation</h2><p className="mt-1 text-sm text-black/50">Choisis une prestation du catalogue : prix, unité et TVA sont repris automatiquement si les champs correspondants restent vides.</p></div>
            <form action={addQuoteItemAction} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <input type="hidden" name="quoteId" value={quote.id} />
              <label className="text-sm font-bold md:col-span-2 lg:col-span-4">Catalogue<select name="serviceId" className={field}><option value="">Ligne libre</option>{services.map((service) => <option key={service.id} value={service.id}>{service.category ? `${service.category} — ` : ''}{service.name} · {Number(service.unitPriceHT).toFixed(2)} € HT</option>)}</select></label>
              <label className="text-sm font-bold md:col-span-2">Description <span className="font-normal text-black/40">(pour une ligne libre ou pour remplacer le libellé)</span><input name="description" className={field} /></label>
              <label className="text-sm font-bold">Quantité<input name="quantity" type="number" min="0" step="0.01" defaultValue="1" className={field} /></label>
              <label className="text-sm font-bold">Unité<select name="unit" defaultValue="UNIT" className={field}>{units.map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>
              <label className="text-sm font-bold">Prix HT <span className="font-normal text-black/40">(optionnel)</span><input name="unitPriceHT" type="number" min="0" step="0.01" className={field} /></label>
              <label className="text-sm font-bold">TVA % <span className="font-normal text-black/40">(optionnel)</span><input name="taxRate" type="number" min="0" max="100" step="0.1" className={field} /></label>
              <button className="rounded-xl bg-[#f4c542] px-4 py-3 font-black md:col-span-2 lg:col-span-2 lg:self-end">Ajouter au devis</button>
            </form>
          </section>}

          <section className="rounded-3xl bg-white p-6">
            <div className="mb-5"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Prestations</div><h2 className="mt-1 text-xl font-black">{quote.items.length} ligne{quote.items.length > 1 ? 's' : ''}</h2></div>
            <div className="grid gap-4">{quote.items.length === 0 ? <p className="rounded-2xl bg-black/[0.025] p-6 text-center text-black/45">Le devis est vide.</p> : quote.items.map((item) => <div key={item.id} className="rounded-2xl border border-black/10 p-4">
              {editable ? <form action={updateQuoteItemAction} className="grid gap-3 md:grid-cols-12"><input type="hidden" name="itemId" value={item.id} /><label className="text-xs font-bold md:col-span-5">Désignation<input name="description" defaultValue={item.description} className={field} /></label><label className="text-xs font-bold md:col-span-1">Qté<input name="quantity" type="number" min="0" step="0.01" defaultValue={Number(item.quantity)} className={field} /></label><label className="text-xs font-bold md:col-span-2">Unité<select name="unit" defaultValue={item.unit} className={field}>{units.map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label><label className="text-xs font-bold md:col-span-2">Prix HT<input name="unitPriceHT" type="number" min="0" step="0.01" defaultValue={Number(item.unitPriceHT)} className={field} /></label><label className="text-xs font-bold md:col-span-1">TVA<input name="taxRate" type="number" min="0" max="100" step="0.1" defaultValue={Number(item.taxRate)} className={field} /></label><div className="flex items-end md:col-span-1"><button className="w-full rounded-xl bg-black px-3 py-2.5 text-xs font-bold text-white">OK</button></div></form> : <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto]"><div><div className="font-black">{item.description}</div><div className="mt-1 text-xs text-black/45">{Number(item.quantity)} × {money(item.unitPriceHT)} HT · TVA {Number(item.taxRate)} %</div></div><div className="text-sm text-black/50">HT<br /><strong className="text-black">{money(item.totalHT)}</strong></div><div className="text-sm text-black/50">TVA<br /><strong className="text-black">{money(item.totalTax)}</strong></div><div className="text-sm text-black/50">TTC<br /><strong className="text-black">{money(item.totalTTC)}</strong></div></div>}
              {editable && <div className="mt-3 flex items-center justify-between border-t border-black/[0.06] pt-3"><div className="text-xs text-black/45">Total HT : <strong className="text-black">{money(item.totalHT)}</strong> · TVA : {money(item.totalTax)} · TTC : {money(item.totalTTC)}</div><form action={deleteQuoteItemAction}><input type="hidden" name="itemId" value={item.id} /><button className="text-xs font-bold text-red-700">Supprimer</button></form></div>}
            </div>)}</div>
          </section>
        </div>

        <aside className="grid content-start gap-6">
          <section className="rounded-3xl bg-[#171717] p-6 text-white">
            <div className="text-xs font-black uppercase tracking-[.18em] text-white/40">Total</div><div className="mt-3 text-4xl font-black">{money(quote.totalTTC)}</div><div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm"><div className="flex justify-between text-white/65"><span>Total HT</span><strong className="text-white">{money(quote.subtotalHT)}</strong></div>{Array.from(taxGroups.entries()).sort(([a], [b]) => a - b).map(([rate, group]) => <div key={rate} className="flex justify-between text-white/65"><span>TVA {rate} % sur {money(group.base)}</span><strong className="text-white">{money(group.tax)}</strong></div>)}</div>
            <div className="mt-5 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-white/60">Coût estimé : {money(estimatedCost)}<br />Marge brute estimée : <strong className="text-white">{money(margin)} ({marginRate.toFixed(1)} %)</strong><br /><span className="text-white/40">Donnée interne, jamais affichée au client.</span></div>
          </section>

          {editable && <section className="rounded-3xl bg-white p-6">
            <div className="text-xs font-black uppercase tracking-[.18em] text-black/40">TVA</div><h2 className="mt-1 text-xl font-black">Contexte fiscal</h2><p className="mt-2 text-xs leading-5 text-black/50">Le contexte propose les taux du catalogue. Il ne remplace pas la vérification de l’éligibilité réelle du chantier.</p>
            <form action={applyQuoteTaxContextAction} className="mt-4"><input type="hidden" name="quoteId" value={quote.id} /><select name="taxContext" defaultValue={quote.taxContext} className={field}>{contexts.map(([value, name]) => <option value={value} key={value}>{name}</option>)}</select><button className="mt-3 w-full rounded-xl border border-black/15 px-4 py-3 text-sm font-black">Appliquer les taux du catalogue</button></form>
          </section>}

          <section className="rounded-3xl bg-white p-6">
            <div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Conditions</div><h2 className="mt-1 text-xl font-black">Paramètres du devis</h2>
            {editable ? <form action={updateQuoteMetaAction} className="mt-4 grid gap-4"><input type="hidden" name="id" value={quote.id} /><label className="text-sm font-bold">Contexte TVA<select name="taxContext" defaultValue={quote.taxContext} className={field}>{contexts.map(([value, name]) => <option value={value} key={value}>{name}</option>)}</select></label><label className="text-sm font-bold">Valable jusqu’au<input name="validUntil" type="date" defaultValue={quote.validUntil ? quote.validUntil.toISOString().slice(0, 10) : ''} className={field} /></label><label className="text-sm font-bold">Acompte %<input name="depositPercent" type="number" min="0" max="100" step="0.1" defaultValue={quote.depositPercent == null ? '' : Number(quote.depositPercent)} className={field} /></label><label className="text-sm font-bold">Conditions de paiement<textarea name="paymentTerms" defaultValue={quote.paymentTerms ?? ''} className={`${field} min-h-24`} /></label><label className="text-sm font-bold">Notes client<textarea name="notes" defaultValue={quote.notes ?? ''} className={`${field} min-h-24`} /></label><button className="rounded-xl bg-black px-4 py-3 text-sm font-bold text-white">Enregistrer</button></form> : <div className="mt-4 space-y-3 text-sm text-black/65"><div><strong>Validité :</strong> {quote.validUntil?.toLocaleDateString('fr-FR') || '—'}</div><div><strong>Acompte :</strong> {quote.depositPercent == null ? '—' : `${Number(quote.depositPercent)} %`}</div><div><strong>Contexte TVA :</strong> {contexts.find(([value]) => value === quote.taxContext)?.[1]}</div></div>}
          </section>

          {editable ? <section className="rounded-3xl bg-[#f4c542] p-6"><div className="text-xs font-black uppercase tracking-[.18em] text-black/45">Finalisation</div><h2 className="mt-1 text-xl font-black">Envoyer au client</h2><p className="mt-2 text-sm leading-6 text-black/65">Après cette action, les lignes seront figées. Le client pourra consulter, imprimer et accepter le devis via son lien privé.</p><form action={markQuoteSentAction} className="mt-4"><input type="hidden" name="quoteId" value={quote.id} /><button disabled={!quote.items.length} className="w-full rounded-2xl bg-black px-5 py-4 font-black text-white disabled:opacity-40">Marquer comme envoyé</button></form></section> : <section className="rounded-3xl bg-white p-6"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Lien client</div><a href={publicUrl} target="_blank" rel="noreferrer" className="mt-3 block break-all rounded-2xl bg-black/[0.04] p-4 text-sm font-bold underline">{publicUrl}</a>{quote.acceptedAt && <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900">Accepté le {quote.acceptedAt.toLocaleString('fr-FR')}{quote.taxCertificationName ? ` par ${quote.taxCertificationName}` : ''}.</div>}</section>}
        </aside>
      </div>
    </div>
  </main>
}
