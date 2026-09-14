import { NextResponse } from 'next/server'
import { uploadQuotePhoto, photoReceipt, quotePhotosEnabled } from '@/lib/quote-storage'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 4 * 1024 * 1024
const allowedTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

function originAllowed(request: Request) {
  const origin = request.headers.get('origin')
  return origin === new URL(request.url).origin
}

export async function POST(request: Request) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: 'Origine refusée.' }, { status: 403 })
  }

  if (!quotePhotosEnabled()) return NextResponse.json({ error: 'Les photos sont temporairement indisponibles. Vous pouvez envoyer votre demande sans photo.' }, { status: 503 })

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Photo manquante.' }, { status: 400 })
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: 'Format non pris en charge.' }, { status: 415 })
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Chaque photo doit faire moins de 4 Mo.' }, { status: 413 })
    }

    const path = await uploadQuotePhoto(file)
    return NextResponse.json({ receipt: await photoReceipt(path) })
  } catch (error) {
    console.error('quote photo upload', error)
    return NextResponse.json({ error: 'Impossible d’envoyer la photo.' }, { status: 500 })
  }
}
