'use client'

import { useEffect, useRef, useState } from 'react'

type ImageKey = 'beforeImage' | 'afterImage'

export function ProjectImagesFields({ beforeImage = '', afterImage = '' }: { beforeImage?: string; afterImage?: string }) {
  const [images, setImages] = useState({ beforeImage, afterImage })
  const [uploading, setUploading] = useState<ImageKey | null>(null)
  const [error, setError] = useState('')
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!uploading) return
    const form = container.current?.closest('form')
    if (!form) return
    const preventSubmit = (event: Event) => {
      event.preventDefault()
      setError('Attendez la fin de l’envoi des photos avant d’enregistrer.')
    }
    form.addEventListener('submit', preventSubmit)
    return () => form.removeEventListener('submit', preventSubmit)
  }, [uploading])

  async function chooseImage(key: ImageKey, file?: File) {
    if (!file) return
    setError('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Utilisez une image JPG, PNG ou WebP.')
      return
    }
    if (file.size <= 0 || file.size > 4 * 1024 * 1024) {
      setError('Chaque photo doit faire moins de 4 Mo.')
      return
    }

    setUploading(key)
    try {
      const body = new FormData()
      body.set('file', file)
      const response = await fetch('/api/admin/project-images', { method: 'POST', body })
      const result = await response.json() as { url?: string; error?: string }
      if (!response.ok || !result.url) throw new Error(result.error || 'Envoi impossible.')
      setImages(current => ({ ...current, [key]: result.url! }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Envoi impossible.')
    } finally {
      setUploading(null)
    }
  }

  return <div ref={container} className="grid gap-4 md:col-span-2 md:grid-cols-2">
    {(['beforeImage', 'afterImage'] as const).map(key => <div key={key} className="rounded-xl border border-black/10 p-3">
      <label className="text-sm font-bold">Photo {key === 'beforeImage' ? 'avant' : 'après'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={Boolean(uploading)}
          onChange={event => {
            void chooseImage(key, event.target.files?.[0])
            event.target.value = ''
          }}
          className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:font-bold file:text-white disabled:opacity-50"
        />
      </label>
      {images[key] && <div className="mt-3">
        <img src={images[key]} alt={`Aperçu de la photo ${key === 'beforeImage' ? 'avant' : 'après'}`} className="aspect-[4/3] w-full rounded-lg object-cover" />
        <button type="button" onClick={() => setImages(current => ({ ...current, [key]: '' }))} className="mt-2 text-sm font-bold text-red-700">Retirer la photo</button>
      </div>}
      <label className="mt-3 block text-xs text-black/60">Ou coller une URL
        <input name={key} type="url" value={images[key]} onChange={event => setImages(current => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm text-black" />
      </label>
    </div>)}
    {uploading && <p role="status" className="text-sm font-bold text-black/60 md:col-span-2">Envoi de la photo {uploading === 'beforeImage' ? 'avant' : 'après'}…</p>}
    {error && <p role="alert" className="text-sm font-bold text-red-700 md:col-span-2">{error}</p>}
  </div>
}
