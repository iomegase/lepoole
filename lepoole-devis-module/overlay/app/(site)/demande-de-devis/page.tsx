import type { Metadata } from 'next'
import { QuoteRequestForm } from '@/components/quote-request-form'
import { createQuoteRequestAction } from './actions'

export const metadata: Metadata = {
  title: 'Demande de devis électricien | Le Poole Electric',
  description: 'Décrivez votre projet électrique et joignez vos photos. Le Poole Electric étudie votre demande avant d’établir un devis professionnel.',
}

export default async function QuoteRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>
}) {
  const { sent, error } = await searchParams

  return (
    <main className="py-12 md:py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="text-xs font-black uppercase tracking-[.2em] text-black/45">Le Poole Electric</div>
            <h1 className="mt-3 text-4xl font-black tracking-[-.04em] md:text-6xl">Demande de devis</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-black/60">
              Décrivez votre besoin et ajoutez quelques photos. Aucun prix automatique : Stan étudie le chantier avant de préparer le devis.
            </p>
          </div>

          {sent && (
            <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
              <div className="font-black">Demande transmise.</div>
              <p className="mt-1 text-sm">Référence : <strong>{sent}</strong>. Nous vous recontactons après étude de votre projet.</p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-900">
              Vérifiez les informations obligatoires puis renvoyez la demande.
            </div>
          )}

          <QuoteRequestForm action={createQuoteRequestAction} />
        </div>
      </div>
    </main>
  )
}
