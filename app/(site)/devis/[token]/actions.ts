'use server'

import { redirect } from 'next/navigation'
import { canAnswerQuote } from '@/lib/quote-status'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function acceptQuoteAction(formData: FormData) {
  const token = encodeURIComponent(text(formData, 'token'))
  const name = text(formData, 'name')
  const quote = await prisma.quote.findUnique({ where: { token } })
  if (!quote || !canAnswerQuote(quote)) redirect(`/devis/${token}?error=unavailable`)

  if (!name) redirect(`/devis/${token}?error=name`)
  if (formData.get('acceptTerms') !== 'on') redirect(`/devis/${token}?error=acceptance`)
  if (quote.taxCertificationRequired && formData.get('taxCertification') !== 'on') redirect(`/devis/${token}?error=certification`)

  const now = new Date()
  const result = await prisma.quote.updateMany({
    where: { id: quote.id, status: { in: ['SENT', 'VIEWED'] }, OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
    data: {
      status: 'ACCEPTED',
      acceptedAt: now,
      taxCertificationName: name,
      taxCertificationAcceptedAt: quote.taxCertificationRequired ? now : null,
    },
  })

  if (!result.count) redirect(`/devis/${token}?error=unavailable`)
  revalidatePath('/admin/devis')
  revalidatePath(`/admin/devis/${quote.id}`)
  redirect(`/devis/${token}?accepted=1`)
}

export async function rejectQuoteAction(formData: FormData) {
  const token = encodeURIComponent(text(formData, 'token'))
  const quote = await prisma.quote.findUnique({ where: { token } })
  if (!quote || !canAnswerQuote(quote)) redirect(`/devis/${token}?error=unavailable`)

  const now = new Date()
  const result = await prisma.quote.updateMany({ where: { id: quote.id, status: { in: ['SENT', 'VIEWED'] }, OR: [{ validUntil: null }, { validUntil: { gte: now } }] }, data: { status: 'REJECTED', rejectedAt: now } })
  if (!result.count) redirect(`/devis/${token}?error=unavailable`)
  revalidatePath('/admin/devis')
  revalidatePath(`/admin/devis/${quote.id}`)
  redirect(`/devis/${token}?rejected=1`)
}
