'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function acceptQuoteAction(formData: FormData) {
  const token = text(formData, 'token')
  const name = text(formData, 'name')
  const quote = await prisma.quote.findUnique({ where: { token } })
  if (!quote || !['SENT', 'VIEWED'].includes(quote.status)) redirect(`/devis/${token}?error=unavailable`)

  if (!name) redirect(`/devis/${token}?error=name`)
  if (formData.get('acceptTerms') !== 'on') redirect(`/devis/${token}?error=acceptance`)
  if (quote.taxCertificationRequired && formData.get('taxCertification') !== 'on') redirect(`/devis/${token}?error=certification`)

  const now = new Date()
  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      status: 'ACCEPTED',
      acceptedAt: now,
      taxCertificationName: name,
      taxCertificationAcceptedAt: quote.taxCertificationRequired ? now : null,
    },
  })

  redirect(`/devis/${token}?accepted=1`)
}

export async function rejectQuoteAction(formData: FormData) {
  const token = text(formData, 'token')
  const quote = await prisma.quote.findUnique({ where: { token } })
  if (!quote || !['SENT', 'VIEWED'].includes(quote.status)) redirect(`/devis/${token}?error=unavailable`)

  await prisma.quote.update({ where: { id: quote.id }, data: { status: 'REJECTED', rejectedAt: new Date() } })
  redirect(`/devis/${token}?rejected=1`)
}
