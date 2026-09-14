import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { MAX_PROJECT_IMAGE_SIZE, projectImagesEnabled, uploadProjectImage } from '@/lib/project-storage'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Connexion administrateur requise.' }, { status: 401 })
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Origine refusée.' }, { status: 403 })
  }
  if (!projectImagesEnabled()) {
    return NextResponse.json({ error: 'Stockage des photos non configuré.' }, { status: 503 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Photo manquante.' }, { status: 400 })
    if (file.size <= 0 || file.size > MAX_PROJECT_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Chaque photo doit faire moins de 4 Mo.' }, { status: 413 })
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'Utilisez une image JPG, PNG ou WebP.' }, { status: 415 })
    }
    return NextResponse.json({ url: await uploadProjectImage(file) })
  } catch (error) {
    console.error('project image upload', error)
    return NextResponse.json({ error: 'Impossible d’envoyer la photo. Vérifiez le stockage Supabase.' }, { status: 500 })
  }
}
