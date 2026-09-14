'use server'

import { redirect } from 'next/navigation'
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
  if (text(formData, 'company')) redirect('/demande-de-devis?sent=1')

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
    redirect('/demande-de-devis?error=missing')
  }

  if (!customerEmail.includes('@')) redirect('/demande-de-devis?error=email')

  const workType = workTypes.has(requestedWorkType) ? requestedWorkType : 'OTHER'
  const buildingAge = buildingAges.has(requestedBuildingAge) ? requestedBuildingAge : 'UNKNOWN'
  const urgency = urgencies.has(requestedUrgency) ? requestedUrgency : 'NORMAL'
  const photoPaths = formData
    .getAll('photoPath')
    .map(String)
    .filter((path) => path.startsWith('requests/'))
    .slice(0, 5)

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

  redirect(`/demande-de-devis?sent=${encodeURIComponent(number)}`)
}
