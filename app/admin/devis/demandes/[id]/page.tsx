import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { signedQuotePhotoUrl } from '@/lib/quote-storage'
import { createQuoteFromRequestAction, updateQuoteRequestStatusAction } from '../../actions'

const workLabels: Record<string, string> = {
  TROUBLESHOOTING: 'Dépannage / recherche de panne', RENOVATION: 'Rénovation électrique', NEW_CONSTRUCTION: 'Construction neuve', ENERGY_RENOVATION: 'Rénovation énergétique', EXTENSION: 'Extension / agrandissement', OTHER: 'Autre',
}
const ageLabels: Record<string, string> = { UNKNOWN: 'Non renseignée', UNDER_2_YEARS: 'Moins de 2 ans', OVER_2_YEARS: 'Plus de 2 ans' }
const urgencyLabels: Record<string, string> = { NORMAL: 'Projet planifié', SOON: 'Prochainement', URGENT: 'Urgent' }

export default async function QuoteRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect('/admin/login')
  const { id } = await params
  const request = await prisma.quoteRequest.findUnique({ where: { id }, include: { photos: { orderBy: { sortOrder: 'asc' } }, quotes: { orderBy: { createdAt: 'desc' } } } })
  if (!request) notFound()
  const photos = await Promise.all(request.photos.map(async (photo) => ({ ...photo, url: await signedQuotePhotoUrl(photo.storagePath) })))

  return <main className="min-h-screen bg-[#eef0f2] p-4 md:p-8">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><Link href="/admin/devis" className="text-sm font-bold text-black/45">← Retour aux devis</Link><h1 className="mt-3 text-3xl font-black">{request.number}</h1><p className="mt-1 text-sm text-black/50">Reçue le {request.createdAt.toLocaleString('fr-FR')}</p></div>
        <form action={updateQuoteRequestStatusAction} className="flex gap-2"><input type="hidden" name="id" value={request.id} /><select name="status" defaultValue={request.status} className="rounded-full border border-black/15 bg-white px-4 py-3 text-sm font-bold"><option value="NEW">Nouvelle</option><option value="REVIEWING">En étude</option><option value="QUOTED">Devis créé</option><option value="ARCHIVED">Archivée</option></select><button className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white">Mettre à jour</button></form>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <section className="rounded-3xl bg-white p-6 md:p-8">
          <div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Client</div>
          <h2 className="mt-2 text-2xl font-black">{request.customerName}</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><a href={`tel:${request.customerPhone}`} className="rounded-2xl bg-black/[0.035] p-4 font-bold">{request.customerPhone}</a><a href={`mailto:${request.customerEmail}`} className="rounded-2xl bg-black/[0.035] p-4 font-bold">{request.customerEmail}</a></div>
          <div className="mt-6 border-t border-black/10 pt-6"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Chantier</div><p className="mt-2 font-bold">{request.address}</p><p className="text-black/55">{[request.postalCode, request.city].filter(Boolean).join(' ')}</p></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-black/10 p-4"><div className="text-xs font-bold text-black/40">Travaux</div><div className="mt-1 font-black">{workLabels[request.workType]}</div></div><div className="rounded-2xl border border-black/10 p-4"><div className="text-xs font-bold text-black/40">Ancienneté</div><div className="mt-1 font-black">{ageLabels[request.buildingAge]}</div></div><div className="rounded-2xl border border-black/10 p-4"><div className="text-xs font-bold text-black/40">Priorité</div><div className="mt-1 font-black">{urgencyLabels[request.urgency]}</div></div></div>
          <div className="mt-6"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Description</div><p className="mt-3 whitespace-pre-wrap leading-7 text-black/70">{request.description}</p></div>
          {request.availability && <div className="mt-6"><div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Disponibilités</div><p className="mt-2 text-black/70">{request.availability}</p></div>}
        </section>

        <div className="grid content-start gap-6">
          <section className="rounded-3xl bg-white p-6">
            <div className="text-xs font-black uppercase tracking-[.18em] text-black/40">Photos</div><h2 className="mt-1 text-xl font-black">{photos.length} photo{photos.length > 1 ? 's' : ''}</h2>
            {photos.length ? <div className="mt-4 grid grid-cols-2 gap-3">{photos.map((photo, index) => photo.url ? <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl bg-black/[0.04]"><img src={photo.url} alt={`Photo chantier ${index + 1}`} className="aspect-square h-full w-full object-cover transition group-hover:scale-[1.02]" /></a> : <div key={photo.id} className="grid aspect-square place-items-center rounded-2xl bg-black/[0.04] text-xs text-black/40">Indisponible</div>)}</div> : <p className="mt-4 text-sm text-black/45">Aucune photo jointe.</p>}
          </section>

          <section className="rounded-3xl bg-[#171717] p-6 text-white">
            <div className="text-xs font-black uppercase tracking-[.18em] text-white/40">Devis professionnel</div><h2 className="mt-2 text-2xl font-black">Créer le devis</h2><p className="mt-2 text-sm leading-6 text-white/60">Les coordonnées et le contexte du chantier seront repris. Le taux de TVA reste contrôlable ligne par ligne.</p>
            <form action={createQuoteFromRequestAction} className="mt-5"><input type="hidden" name="requestId" value={request.id} /><button className="w-full rounded-2xl bg-[#f4c542] px-5 py-4 font-black text-black">Créer un nouveau devis</button></form>
            {request.quotes.length > 0 && <div className="mt-5 border-t border-white/10 pt-5"><div className="mb-2 text-xs font-bold text-white/40">Déjà créés</div>{request.quotes.map((quote) => <Link key={quote.id} href={`/admin/devis/${quote.id}`} className="mt-2 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold"><span>{quote.number}</span><span>{quote.status}</span></Link>)}</div>}
          </section>
        </div>
      </div>
    </div>
  </main>
}
