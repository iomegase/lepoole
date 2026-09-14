'use server'

import { revalidatePath } from 'next/cache'
import { verifyPhotoReceipt } from '@/lib/quote-storage'
import { prisma } from '@/lib/prisma'
import { nextDocumentNumber } from '@/lib/document-number'
import type { BuildingAge, QuoteRequestWorkType, QuoteUrgency } from '@prisma/client'

const workTypes = new Set<QuoteRequestWorkType>([
  'TROUBLESHOOTING',
  'RENOVATION',
  'NEW_CONSTRUCTION',
  'ENERGY_RENOVATION',
  'EXTENSION',
  'OTHER',
])
const buildingAges = new Set<BuildingAge>(['UNKNOWN', 'UNDER_2_YEARS', 'OVER_2_YEARS'])
const urgencies = new Set<QuoteUrgency>(['NORMAL', 'SOON', 'URGENT'])

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function createQuoteRequestAction(formData: FormData) {
  if (text(formData, 'company')) return { error: 'Impossible de transmettre la demande.' }

  const customerName = text(formData, 'customerName')
  const customerEmail = text(formData, 'customerEmail').toLowerCase()
  const customerPhone = text(formData, 'customerPhone')
  const address = text(formData, 'address')
  const postalCode = text(formData, 'postalCode') || null
  const city = text(formData, 'city') || null
  const description = text(formData, 'description')
  const availability = text(formData, 'availability') || null
  const requestedWorkType = text(formData, 'workType') as QuoteRequestWorkType
  const requestedBuildingAge = text(formData, 'buildingAge') as BuildingAge
  const requestedUrgency = text(formData, 'urgency') as QuoteUrgency
  const consent = formData.get('consent') === 'on'

  if (!customerName || !customerEmail || !customerPhone || !address || description.length < 10 || !consent) {
    return { error: 'Vérifiez vos coordonnées, la description et votre consentement.' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return { error: 'Vérifiez votre adresse email.' }
  if (customerName.length > 160 || customerEmail.length > 254 || customerPhone.length > 40 || address.length > 500 || description.length > 10000 || (availability?.length ?? 0) > 1000) return { error: 'Certains champs sont trop longs.' }

  const workType = workTypes.has(requestedWorkType) ? requestedWorkType : 'OTHER'
  const buildingAge = buildingAges.has(requestedBuildingAge) ? requestedBuildingAge : 'UNKNOWN'
  const urgency = urgencies.has(requestedUrgency) ? requestedUrgency : 'NORMAL'
  const receipts = [...new Set(formData.getAll('photoReceipt').map(String))]
  if (receipts.length > 5) return { error: 'Vous pouvez joindre au maximum 5 photos.' }
  let photoPaths: string[]
  try {
    photoPaths = await Promise.all(receipts.map(verifyPhotoReceipt))
  } catch {
    return { error: 'Une photo a expiré. Sélectionnez à nouveau vos photos.' }
  }

  const number = await nextDocumentNumber('DEM')

  await prisma.quoteRequest.create({
    data: {
      number,
      customerName,
      customerEmail,
      customerPhone,
      address,
      postalCode,
      city,
      workType,
      buildingAge,
      description,
      availability,
      urgency,
      rgpdConsentAt: new Date(),
      photos: {
        create: photoPaths.map((storagePath, index) => ({ storagePath, sortOrder: index })),
      },
    },
  })

  revalidatePath('/admin/devis')
  return { number }
}
