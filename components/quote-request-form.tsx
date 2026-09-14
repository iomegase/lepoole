'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useRef, useState, useTransition } from 'react'

type Props = {
  action: (formData: FormData) => Promise<{ error?: string; number?: string }>
  photosEnabled: boolean
}

const field = 'mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-base outline-none transition focus:border-black/35 focus:ring-4 focus:ring-black/[0.04]'
const label = 'block text-sm font-bold text-black/75'

export function QuoteRequestForm({ action, photosEnabled }: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()

  function validateStep(currentStep: number) {
    const form = formRef.current
    if (!form) return false
    const controls = Array.from(form.querySelectorAll<HTMLElement>(`[data-step="${currentStep}"] input, [data-step="${currentStep}"] select, [data-step="${currentStep}"] textarea`))
    for (const control of controls) {
      if ('checkValidity' in control && typeof control.checkValidity === 'function' && !control.checkValidity()) {
        if ('reportValidity' in control && typeof control.reportValidity === 'function') control.reportValidity()
        return false
      }
    }
    return true
  }

  function next() {
    setError('')
    if (!validateStep(step)) return
    setStep((value) => Math.min(3, value + 1))
  }

  function previous() {
    setError('')
    setStep((value) => Math.max(1, value - 1))
  }

  function chooseFiles(list: FileList | null) {
    setError('')
    const selected = Array.from(list ?? []).slice(0, 5)
    const invalid = selected.find((file) => file.size > 4 * 1024 * 1024)
    if (invalid) {
      setError(`La photo « ${invalid.name} » dépasse 4 Mo.`)
      return
    }
    setFiles(selected)
  }

  async function uploadPhotos() {
    const paths: string[] = []
    for (const file of files) {
      const body = new FormData()
      body.append('file', file)
      const response = await fetch('/api/devis/photos', { method: 'POST', body })
      const data = await response.json() as { receipt?: string; error?: string }
      if (!response.ok || !data.receipt) throw new Error(data.error || 'Envoi de photo impossible.')
      paths.push(data.receipt)
    }
    return paths
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const form = formRef.current
    if (!form || busy) return
    for (let current = 1; current <= 3; current++) {
      if (!validateStep(current)) { setStep(current); return }
    }

    try {
      setUploading(true)
      const paths = await uploadPhotos()
      const data = new FormData(form)
      for (const receipt of paths) data.append('photoReceipt', receipt)
      startTransition(async () => {
        try {
          const result = await action(data)
          if (result.error) setError(result.error)
          else if (result.number) router.push(`/demande-de-devis?sent=${encodeURIComponent(result.number)}`)
        } catch {
          setError('La demande n’a pas pu être envoyée. Réessayez dans un instant.')
        }
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible d’envoyer la demande.')
    } finally {
      setUploading(false)
    }
  }

  const busy = uploading || pending

  return (
    <form noValidate ref={formRef} onSubmit={submit} className="rounded-[32px] border border-black/[0.08] bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,.06)] md:p-8">
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="mb-8 grid grid-cols-3 gap-2">
        {['Coordonnées', 'Projet', 'Photos'].map((name, index) => {
          const number = index + 1
          const active = step === number
          const done = step > number
          return (
            <button key={name} type="button" disabled={busy} onClick={() => done && setStep(number)} className="text-left">
              <div className={`h-1.5 rounded-full ${active || done ? 'bg-[#171717]' : 'bg-black/10'}`} />
              <div className={`mt-2 text-xs font-bold ${active ? 'text-black' : 'text-black/35'}`}>{number}. {name}</div>
            </button>
          )
        })}
      </div>

      <div data-step="1" className={step === 1 ? 'grid gap-5' : 'hidden'}>
        <div>
          <h2 className="text-2xl font-black tracking-[-.03em]">Vos coordonnées</h2>
          <p className="mt-1 text-sm text-black/50">Pour pouvoir vous rappeler et localiser le chantier.</p>
        </div>
        <label className={label}>Nom et prénom<input className={field} name="customerName" autoComplete="name" required /></label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={label}>Email<input className={field} name="customerEmail" type="email" autoComplete="email" required /></label>
          <label className={label}>Téléphone<input className={field} name="customerPhone" type="tel" autoComplete="tel" required /></label>
        </div>
        <label className={label}>Adresse du chantier<input className={field} name="address" autoComplete="street-address" required /></label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={label}>Code postal<input className={field} name="postalCode" inputMode="numeric" autoComplete="postal-code" /></label>
          <label className={label}>Ville<input className={field} name="city" autoComplete="address-level2" /></label>
        </div>
      </div>

      <div data-step="2" className={step === 2 ? 'grid gap-5' : 'hidden'}>
        <div>
          <h2 className="text-2xl font-black tracking-[-.03em]">Votre projet</h2>
          <p className="mt-1 text-sm text-black/50">Ces informations nous aident à comprendre vos besoins et à préparer un devis adapté.</p>
        </div>
        <label className={label}>Type de travaux
          <select className={field} name="workType" defaultValue="RENOVATION" required>
            <option value="TROUBLESHOOTING">Dépannage / recherche de panne</option>
            <option value="RENOVATION">Rénovation électrique</option>
            <option value="NEW_CONSTRUCTION">Construction neuve</option>
            <option value="ENERGY_RENOVATION">Rénovation énergétique</option>
            <option value="EXTENSION">Extension / agrandissement</option>
            <option value="OTHER">Autre</option>
          </select>
        </label>
        <label className={label}>Ancienneté du logement
          <select className={field} name="buildingAge" defaultValue="UNKNOWN">
            <option value="UNKNOWN">Je ne sais pas</option>
            <option value="OVER_2_YEARS">Achevé depuis plus de 2 ans</option>
            <option value="UNDER_2_YEARS">Achevé depuis moins de 2 ans</option>
          </select>
        </label>
        <label className={label}>Décrivez les travaux
          <textarea className={`${field} min-h-36 resize-y`} name="description" minLength={10} required placeholder="Ex. remplacement d’un tableau ancien, ajout de prises dans une cuisine, rénovation complète…" />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={label}>Niveau d’urgence
            <select className={field} name="urgency" defaultValue="NORMAL">
              <option value="NORMAL">Projet planifié</option>
              <option value="SOON">À réaliser prochainement</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
          <label className={label}>Disponibilités<textarea className={`${field} min-h-24`} name="availability" placeholder="Ex. mardi après 16 h" /></label>
        </div>
      </div>

      <div data-step="3" className={step === 3 ? 'grid gap-5' : 'hidden'}>
        <div>
          <h2 className="text-2xl font-black tracking-[-.03em]">Photos du chantier</h2>
          <p className="mt-1 text-sm text-black/50">Facultatif, jusqu’à 5 photos. 4 Mo maximum par photo.</p>
        </div>
        {photosEnabled ? <label className="block cursor-pointer rounded-3xl border border-dashed border-black/20 bg-[#f6f3ec] p-8 text-center transition hover:border-black/40">
          <span className="font-black">Ajouter des photos</span>
          <span className="mt-1 block text-sm text-black/50">JPG, PNG, WebP ou HEIC</span>
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={(event) => chooseFiles(event.target.files)} />
        </label>
        : <p className="rounded-2xl bg-[#f6f3ec] p-4 text-sm text-black/60">L’ajout de photos est temporairement indisponible. Vous pouvez envoyer votre demande et transmettre vos photos lors de notre échange.</p>}
        {files.length > 0 && (
          <div className="rounded-2xl bg-black/[0.035] p-4 text-sm">
            <div className="font-bold">{files.length} photo{files.length > 1 ? 's' : ''} sélectionnée{files.length > 1 ? 's' : ''}</div>
            <ul className="mt-2 space-y-1 text-black/55">{files.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}</ul>
          </div>
        )}
        <label className="flex items-start gap-3 rounded-2xl border border-black/10 p-4 text-sm leading-6 text-black/65">
          <input className="mt-1" type="checkbox" name="consent" required />
          <span>J’accepte que mes coordonnées et les informations du chantier soient utilisées pour traiter cette demande de devis.</span>
        </label>
      </div>

      {error && <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{error}</div>}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-black/10 pt-6">
        <button type="button" onClick={previous} disabled={step === 1 || busy} className="rounded-full border border-black/15 px-5 py-3 text-sm font-bold disabled:opacity-30">Retour</button>
        {step < 3 ? (
          <button type="button" onClick={next} disabled={busy} className="rounded-full bg-[#171717] px-6 py-3 text-sm font-black text-white">Continuer</button>
        ) : (
          <button type="submit" disabled={busy} className="rounded-full bg-[#f4c542] px-6 py-3 text-sm font-black text-black disabled:opacity-50">
            {busy ? 'Envoi…' : 'Envoyer la demande'}
          </button>
        )}
      </div>
    </form>
  )
}
