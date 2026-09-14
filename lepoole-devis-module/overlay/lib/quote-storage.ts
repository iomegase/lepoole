const bucket = process.env.SUPABASE_QUOTE_BUCKET || 'quote-requests'

function storageConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase Storage non configuré')
  return { url: url.replace(/\/$/, ''), key }
}

function encodePath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/')
}

export async function uploadQuotePhoto(file: File) {
  const { url, key } = storageConfig()
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const storagePath = `requests/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${encodePath(storagePath)}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'false',
    },
    body: Buffer.from(await file.arrayBuffer()),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Upload Supabase impossible: ${detail}`)
  }

  return storagePath
}

export async function signedQuotePhotoUrl(storagePath: string, expiresIn = 3600) {
  const { url, key } = storageConfig()
  const response = await fetch(`${url}/storage/v1/object/sign/${bucket}/${encodePath(storagePath)}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn }),
    cache: 'no-store',
  })

  if (!response.ok) return null

  const data = await response.json() as { signedURL?: string; signedUrl?: string }
  const signed = data.signedURL || data.signedUrl
  if (!signed) return null
  if (signed.startsWith('http')) return signed
  if (signed.startsWith('/storage/v1/')) return `${url}${signed}`
  return `${url}/storage/v1${signed.startsWith('/') ? '' : '/'}${signed}`
}
