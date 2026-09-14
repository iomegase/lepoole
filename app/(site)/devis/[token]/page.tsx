import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { canAnswerQuote, quoteExpired } from '@/lib/quote-status'
import { prisma } from '@/lib/prisma'
import { getSettings } from '@/lib/data'
import { PrintButton } from '@/components/print-button'
import { acceptQuoteAction, rejectQuoteAction } from './actions'

export const metadata: Metadata = {
  title: 'Devis | Le Poole Electric',
  robots: { index: false, follow: false, nocache: true },
}

function money(value: unknown) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value))
}

const unitLabels: Record<string, string> = { UNIT: 'unité', HOUR: 'h', METER: 'm', M2: 'm²', FORFAIT: 'forfait', DAY: 'jour' }

export default async function PublicQuotePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ accepted?: string; rejected?: string; error?: string }> }) {
  const { token } = await params
  const query = await searchParams
  let quote = await prisma.quote.findUnique({ where: { token }, include: { items: { orderBy: { position: 'asc' } } } })
  if (!quote || quote.status === 'DRAFT') notFound()
  if (quote.status === 'SENT') {
    await prisma.quote.updateMany({ where: { id: quote.id, status: 'SENT' }, data: { status: 'VIEWED' } })
    quote = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id }, include: { items: { orderBy: { position: 'asc' } } } })
  }
  const settings = await getSettings()
  const taxGroups = new Map<number, { base: number; tax: number }>()
  for (const item of quote.items) {
    const rate = Number(item.taxRate)
    const current = taxGroups.get(rate) || { base: 0, tax: 0 }
    current.base += Number(item.totalHT)
    current.tax += Number(item.totalTax)
    taxGroups.set(rate, current)
  }
  const canAnswer = canAnswerQuote(quote)
  const expired = quote.status === 'EXPIRED' || (['SENT', 'VIEWED'].includes(quote.status) && quoteExpired(quote.validUntil))

  return <main className="py-10 md:py-16 print:bg-white print:py-0">
    <div className="container print:w-full print:max-w-none">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden"><div className="text-sm font-bold text-black/45">Document privé · {quote.number}</div><PrintButton /></div>
        {query.accepted && quote.status === 'ACCEPTED' && <div className="mb-6 rounded-3xl bg-emerald-100 p-5 font-bold text-emerald-950 print:hidden">Merci. Le devis a bien été accepté.</div>}
        {query.rejected && quote.status === 'REJECTED' && <div className="mb-6 rounded-3xl bg-black/[0.05] p-5 font-bold print:hidden">Votre refus a bien été enregistré.</div>}
        {query.error && <div className="mb-6 rounded-3xl bg-red-50 p-5 text-sm font-bold text-red-900 print:hidden">Impossible de valider cette action. Vérifiez les informations demandées.</div>}

        <article className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,.06)] print:rounded-none print:border-0 print:shadow-none">
          <header className="bg-[#171717] p-6 text-white md:p-10 print:bg-white print:text-black">
            <div className="flex flex-wrap justify-between gap-6"><div><div className="text-xs font-black uppercase tracking-[.2em] text-white/45 print:text-black/45">{settings.companyName}</div><h1 className="mt-2 text-4xl font-black tracking-[-.04em]">Devis {quote.number}</h1><p className="mt-2 text-sm text-white/55 print:text-black/55">Émis le {quote.createdAt.toLocaleDateString('fr-FR')}{quote.validUntil ? ` · valable jusqu’au ${quote.validUntil.toLocaleDateString('fr-FR')}` : ''}</p></div><div className="text-sm leading-6 text-white/65 print:text-black/65">{settings.founderName}<br />{settings.address}<br />{settings.phone}<br />{settings.email}</div></div>
          </header>

          <div className="p-6 md:p-10">
            <div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-black/[0.035] p-5"><div className="text-xs font-black uppercase tracking-[.15em] text-black/40">Client</div><div className="mt-2 text-lg font-black">{quote.customerName}</div><div className="mt-1 text-sm leading-6 text-black/60">{quote.customerEmail}<br />{quote.customerPhone}</div></div><div className="rounded-2xl bg-black/[0.035] p-5"><div className="text-xs font-black uppercase tracking-[.15em] text-black/40">Chantier</div><div className="mt-2 font-black">{quote.workAddress}</div><div className="mt-1 text-sm text-black/60">{[quote.postalCode, quote.city].filter(Boolean).join(' ')}</div></div></div>

            <div className="mt-8 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b-2 border-black text-xs uppercase tracking-wide text-black/45"><tr><th className="pb-3 pr-3">Désignation</th><th className="pb-3 text-right">Qté</th><th className="pb-3 text-right">Prix HT</th><th className="pb-3 text-right">TVA</th><th className="pb-3 text-right">Total HT</th></tr></thead><tbody>{quote.items.map((item) => <tr key={item.id} className="border-b border-black/10"><td className="py-4 pr-3 font-bold">{item.description}</td><td className="py-4 text-right">{Number(item.quantity)} {unitLabels[item.unit]}</td><td className="py-4 text-right">{money(item.unitPriceHT)}</td><td className="py-4 text-right">{Number(item.taxRate)} %</td><td className="py-4 text-right font-bold">{money(item.totalHT)}</td></tr>)}</tbody></table></div>

            <div className="mt-8 ml-auto max-w-md rounded-3xl bg-[#f6f3ec] p-6"><div className="flex justify-between text-sm"><span>Total HT</span><strong>{money(quote.subtotalHT)}</strong></div>{Array.from(taxGroups.entries()).sort(([a], [b]) => a - b).map(([rate, group]) => <div key={rate} className="mt-2 flex justify-between text-sm text-black/65"><span>TVA {rate} % <span className="text-black/35">(base {money(group.base)})</span></span><strong className="text-black">{money(group.tax)}</strong></div>)}<div className="mt-5 flex items-end justify-between border-t border-black/15 pt-5"><span className="font-black">TOTAL TTC</span><strong className="text-3xl font-black">{money(quote.totalTTC)}</strong></div>{quote.depositPercent != null && <div className="mt-4 flex justify-between rounded-xl bg-white p-3 text-sm"><span>Acompte demandé ({Number(quote.depositPercent)} %)</span><strong>{money(Number(quote.totalTTC) * Number(quote.depositPercent) / 100)}</strong></div>}</div>

            {(quote.paymentTerms || quote.notes) && <div className="mt-8 grid gap-6 border-t border-black/10 pt-8 md:grid-cols-2">{quote.paymentTerms && <div><h2 className="text-sm font-black uppercase tracking-wide">Conditions</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/60">{quote.paymentTerms}</p></div>}{quote.notes && <div><h2 className="text-sm font-black uppercase tracking-wide">Notes</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/60">{quote.notes}</p></div>}</div>}
          </div>
        </article>

        {expired && <div className="mt-6 rounded-3xl bg-amber-50 p-6 font-bold print:hidden">Ce devis a expiré. Contactez-nous pour actualiser votre proposition.</div>}
        {canAnswer && <section className="mt-6 rounded-[32px] bg-white p-6 shadow-[0_16px_60px_rgba(0,0,0,.05)] md:p-8 print:hidden"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Réponse client</div><h2 className="mt-1 text-2xl font-black">Accepter ce devis</h2><form action={acceptQuoteAction} className="mt-5 grid gap-4"><input type="hidden" name="token" value={quote.token} /><label className="text-sm font-bold">Nom et prénom du signataire<input name="name" required className="mt-2 w-full rounded-2xl border border-black/15 px-4 py-3" defaultValue={quote.customerName} /></label>{quote.taxCertificationRequired && <label className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><input name="taxCertification" type="checkbox" required className="mt-1" /><span>Je certifie que les conditions permettant l’application du ou des taux réduits de TVA indiqués sur ce devis sont remplies pour le logement et les travaux concernés.</span></label>}<label className="flex items-start gap-3 text-sm leading-6 text-black/60"><input type="checkbox" name="acceptTerms" required className="mt-1" /><span>J’accepte les travaux, prix et conditions figurant sur le devis {quote.number}.</span></label><button className="rounded-2xl bg-[#f4c542] px-5 py-4 font-black">Accepter le devis</button></form><form action={rejectQuoteAction} className="mt-3"><input type="hidden" name="token" value={quote.token} /><button className="w-full rounded-2xl border border-black/15 px-5 py-3 text-sm font-bold">Refuser le devis</button></form><p className="mt-4 text-xs leading-5 text-black/40">Votre réponse et sa date sont enregistrées avec ce devis. Conservez une copie du document pour vos dossiers.</p></section>}
        {quote.status === 'ACCEPTED' && <div className="mt-6 rounded-3xl bg-emerald-100 p-6 text-center font-black text-emerald-950 print:hidden">Devis accepté le {quote.acceptedAt?.toLocaleString('fr-FR')}.</div>}
        {quote.status === 'REJECTED' && <div className="mt-6 rounded-3xl bg-black/[0.05] p-6 text-center font-black print:hidden">Devis refusé.</div>}
      </div>
    </div>
  </main>
}
