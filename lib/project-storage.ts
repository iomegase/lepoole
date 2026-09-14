const bucket = process.env.SUPABASE_PROJECT_BUCKET || 'project-images'

const imageTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

export const MAX_PROJECT_IMAGE_SIZE = 4 * 1024 * 1024

export function projectImagesEnabled() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function storageConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Stockage des réalisations non configuré')
  if (!/^[a-z0-9][a-z0-9-]*$/.test(bucket)) throw new Error('Nom de bucket invalide')
  return { url: url.replace(/\/$/, ''), key }
}

export function projectImageType(bytes: Uint8Array, declaredType: string) {
  const signatures: Record<keyof typeof imageTypes, boolean> = {
    'image/jpeg': bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
    'image/png': bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte),
    'image/webp': bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP',
  }
  return Object.hasOwn(imageTypes, declaredType) && signatures[declaredType as keyof typeof imageTypes]
    ? imageTypes[declaredType as keyof typeof imageTypes]
    : null
}

async function ensurePublicBucket(url: string, key: string) {
  const headers = { apikey: key, Authorization: `Bearer ${key}` }
  const lookup = await fetch(`${url}/storage/v1/bucket/${bucket}`, { headers, cache: 'no-store' })
  if (lookup.ok) {
    const current = await lookup.json() as { public?: boolean }
    if (!current.public) throw new Error('Le bucket des réalisations doit être public')
    return
  }
  if (lookup.status !== 404) throw new Error('Impossible de vérifier le bucket des réalisations')

  const created = await fetch(`${url}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: MAX_PROJECT_IMAGE_SIZE,
      allowed_mime_types: Object.keys(imageTypes),
    }),
  })
  if (!created.ok && created.status !== 409) throw new Error('Impossible de créer le bucket des réalisations')
  if (created.status === 409) {
    const retry = await fetch(`${url}/storage/v1/bucket/${bucket}`, { headers, cache: 'no-store' })
    if (!retry.ok || !(await retry.json() as { public?: boolean }).public) throw new Error('Le bucket des réalisations doit être public')
  }
}

export async function uploadProjectImage(file: File) {
  const { url, key } = storageConfig()
  const bytes = new Uint8Array(await file.arrayBuffer())
  const extension = projectImageType(bytes, file.type)
  if (!extension) throw new Error('Format de photo invalide')
  if (bytes.length === 0 || bytes.length > MAX_PROJECT_IMAGE_SIZE) throw new Error('Photo trop volumineuse')

  await ensurePublicBucket(url, key)
  const path = `projects/${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': file.type,
      'Cache-Control': '3600',
      'x-upsert': 'false',
    },
    body: bytes,
  })
  if (!response.ok) throw new Error('Envoi de la photo impossible')
  return `${url}/storage/v1/object/public/${bucket}/${path}`
}
