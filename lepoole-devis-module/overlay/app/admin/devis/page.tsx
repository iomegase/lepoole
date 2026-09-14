import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const requestLabels: Record<string, string> = { NEW: 'Nouvelle', REVIEWING: 'En étude', QUOTED: 'Devis créé', ARCHIVED: 'Archivée' }
const quoteLabels: Record<string, string> = { DRAFT: 'Brouillon', SENT: 'Envoyé', VIEWED: 'Consulté', ACCEPTED: 'Accepté', REJECTED: 'Refusé', EXPIRED: 'Expiré' }

function money(value: unknown) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value))
}

export default async function QuotesAdminPage() {
  if (!(await isAdmin())) redirect('/admin/login')

  const [requests, quotes, newCount, draftCount, acceptedCount] = await Promise.all([
    prisma.quoteRequest.findMany({ take: 30, orderBy: { createdAt: 'desc' }, include: { _count: { select: { photos: true, quotes: true } } } }),
    prisma.quote.findMany({ take: 30, orderBy: { createdAt: 'desc' } }),
    prisma.quoteRequest.count({ where: { status: 'NEW' } }),
    prisma.quote.count({ where: { status: 'DRAFT' } }),
    prisma.quote.count({ where: { status: 'ACCEPTED' } }),
  ])

  return <main className="min-h-screen bg-[#eef0f2] p-4 md:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Le Poole Electric</div><h1 className="mt-1 text-3xl font-black">Devis</h1><p className="mt-2 text-sm text-black/55">Demandes clients, préparation des devis et suivi des acceptations.</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/admin" className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold">Administration</Link><Link href="/admin/catalogue" className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white">Catalogue tarifs</Link></div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[['Nouvelles demandes', newCount], ['Devis brouillons', draftCount], ['Devis acceptés', acceptedCount]].map(([label, value]) => <div key={String(label)} className="rounded-3xl bg-white p-6"><div className="text-sm font-bold text-black/45">{label}</div><div className="mt-2 text-4xl font-black">{value}</div></div>)}
      </div>

      <section className="mt-6 rounded-3xl bg-white p-6">
        <div className="mb-5"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Entrantes</div><h2 className="mt-1 text-xl font-black">Demandes de devis</h2></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-black/10 text-xs uppercase tracking-wide text-black/40"><tr><th className="pb-3">Référence</th><th className="pb-3">Client</th><th className="pb-3">Chantier</th><th className="pb-3">État</th><th className="pb-3">Pièces</th><th className="pb-3"></th></tr></thead><tbody>{requests.map((request) => <tr key={request.id} className="border-b border-black/[0.06] last:border-0"><td className="py-4 font-black">{request.number}<div className="mt-1 text-xs font-normal text-black/40">{request.createdAt.toLocaleDateString('fr-FR')}</div></td><td className="py-4"><div className="font-bold">{request.customerName}</div><div className="text-black/45">{request.customerPhone}</div></td><td className="py-4">{request.city || request.address}</td><td className="py-4"><span className="rounded-full bg-black/[0.05] px-3 py-1 text-xs font-bold">{requestLabels[request.status]}</span></td><td className="py-4 text-black/55">{request._count.photos} photo{request._count.photos > 1 ? 's' : ''} · {request._count.quotes} devis</td><td className="py-4 text-right"><Link href={`/admin/devis/demandes/${request.id}`} className="rounded-full border border-black/15 px-4 py-2 font-bold">Ouvrir</Link></td></tr>)}</tbody></table></div>
        {requests.length === 0 && <p className="py-8 text-center text-black/45">Aucune demande pour le moment.</p>}
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6">
        <div className="mb-5"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Documents commerciaux</div><h2 className="mt-1 text-xl font-black">Devis</h2></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-black/10 text-xs uppercase tracking-wide text-black/40"><tr><th className="pb-3">Devis</th><th className="pb-3">Client</th><th className="pb-3">Montant</th><th className="pb-3">État</th><th className="pb-3"></th></tr></thead><tbody>{quotes.map((quote) => <tr key={quote.id} className="border-b border-black/[0.06] last:border-0"><td className="py-4 font-black">{quote.number}<div className="mt-1 text-xs font-normal text-black/40">{quote.createdAt.toLocaleDateString('fr-FR')}</div></td><td className="py-4"><div className="font-bold">{quote.customerName}</div><div className="text-black/45">{quote.city}</div></td><td className="py-4 font-bold">{money(quote.totalTTC)}</td><td className="py-4"><span className="rounded-full bg-black/[0.05] px-3 py-1 text-xs font-bold">{quoteLabels[quote.status]}</span></td><td className="py-4 text-right"><Link href={`/admin/devis/${quote.id}`} className="rounded-full border border-black/15 px-4 py-2 font-bold">Ouvrir</Link></td></tr>)}</tbody></table></div>
        {quotes.length === 0 && <p className="py-8 text-center text-black/45">Aucun devis créé.</p>}
      </section>
    </div>
  </main>
}
