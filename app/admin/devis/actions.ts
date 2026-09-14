'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'
import { nextDocumentNumber } from '@/lib/document-number'
import { quoteExpired, validityEnd } from '@/lib/quote-status'
import { calculateQuoteLine, recalculateQuoteTotals } from '@/lib/quotes'
import type { QuoteRequestStatus, ServiceUnit, TaxContext } from '@prisma/client'

const units = new Set<ServiceUnit>(['UNIT', 'HOUR', 'METER', 'M2', 'FORFAIT', 'DAY'])
const contexts = new Set<TaxContext>(['NEW_CONSTRUCTION', 'RENOVATION_OVER_2_YEARS', 'RENOVATION_UNDER_2_YEARS', 'ENERGY_RENOVATION', 'OTHER'])
const requestStatuses = new Set<QuoteRequestStatus>(['NEW', 'REVIEWING', 'QUOTED', 'ARCHIVED'])

async function guard() {
  if (!(await isAdmin())) redirect('/admin/login')
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const raw = text(formData, key)
  if (!raw) return fallback
  const value = Number(raw.replace(',', '.'))
  return Number.isFinite(value) ? value : fallback
}

async function editableQuote(id: string) {
  const quote = await prisma.quote.findUniqueOrThrow({ where: { id } })
  if (quote.status !== 'DRAFT') throw new Error('Un devis envoyé ne peut plus être modifié. Créez une nouvelle version.')
  return quote
}

function defaultTaxContext(request: { workType: string; buildingAge: string }): TaxContext {
  if (request.workType === 'NEW_CONSTRUCTION') return 'NEW_CONSTRUCTION'
  if (request.buildingAge === 'UNDER_2_YEARS') return 'RENOVATION_UNDER_2_YEARS'
  if (request.workType === 'ENERGY_RENOVATION' && request.buildingAge === 'OVER_2_YEARS') return 'ENERGY_RENOVATION'
  if (request.buildingAge === 'OVER_2_YEARS') return 'RENOVATION_OVER_2_YEARS'
  return 'OTHER'
}

export async function updateQuoteRequestStatusAction(formData: FormData) {
  await guard()
  const id = text(formData, 'id')
  const value = text(formData, 'status') as QuoteRequestStatus
  if (!requestStatuses.has(value)) redirect(`/admin/devis/demandes/${id}`)
  await prisma.quoteRequest.update({ where: { id }, data: { status: value } })
  revalidatePath('/admin/devis')
  revalidatePath(`/admin/devis/demandes/${id}`)
}

export async function createQuoteFromRequestAction(formData: FormData) {
  await guard()
  const requestId = text(formData, 'requestId')
  const request = await prisma.quoteRequest.findUniqueOrThrow({ where: { id: requestId } })
  const number = await nextDocumentNumber('DEV')
  const validDate = new Date()
  validDate.setDate(validDate.getDate() + 30)
  const validUntil = validityEnd(validDate.toISOString().slice(0, 10))

  const quote = await prisma.quote.create({
    data: {
      number,
      requestId: request.id,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      workAddress: request.address,
      postalCode: request.postalCode,
      city: request.city,
      taxContext: defaultTaxContext(request),
      validUntil,
      paymentTerms: 'Paiement selon les conditions indiquées sur le devis. Toute modification du périmètre fera l’objet d’un accord complémentaire.',
    },
  })

  await prisma.quoteRequest.update({ where: { id: request.id }, data: { status: 'QUOTED' } })
  redirect(`/admin/devis/${quote.id}`)
}

export async function updateQuoteMetaAction(formData: FormData) {
  await guard()
  const id = text(formData, 'id')
  await editableQuote(id)
  const requestedContext = text(formData, 'taxContext') as TaxContext
  const taxContext = contexts.has(requestedContext) ? requestedContext : 'OTHER'
  const validUntilRaw = text(formData, 'validUntil')
  const deposit = numberValue(formData, 'depositPercent')
  if (deposit < 0 || deposit > 100) throw new Error('L’acompte doit être compris entre 0 et 100 %.')

  await prisma.quote.update({
    where: { id },
    data: {
      taxContext,
      validUntil: validUntilRaw ? validityEnd(validUntilRaw) : null,
      depositPercent: text(formData, 'depositPercent') ? numberValue(formData, 'depositPercent') : null,
      paymentTerms: text(formData, 'paymentTerms') || null,
      notes: text(formData, 'notes') || null,
    },
  })

  revalidatePath(`/admin/devis/${id}`)
  redirect(`/admin/devis/${id}?saved=meta`)
}

export async function addQuoteItemAction(formData: FormData) {
  await guard()
  const quoteId = text(formData, 'quoteId')
  const quote = await editableQuote(quoteId)
  const serviceId = text(formData, 'serviceId') ? Number(formData.get('serviceId')) : null
  const service = serviceId ? await prisma.serviceCatalog.findUnique({ where: { id: serviceId }, include: { taxRules: true } }) : null

  const description = text(formData, 'description') || service?.name || ''
  if (!description) throw new Error('Description manquante')

  const quantity = Math.max(0, numberValue(formData, 'quantity', 1))
  const unitPriceHT = text(formData, 'unitPriceHT') ? numberValue(formData, 'unitPriceHT') : Number(service?.unitPriceHT ?? 0)
  const defaultRule = service?.taxRules.find((rule) => rule.context === quote.taxContext)
  const taxRate = text(formData, 'taxRate') ? numberValue(formData, 'taxRate', 20) : Number(defaultRule?.taxRate ?? 20)
  const requestedUnit = text(formData, 'unit') as ServiceUnit
  const unit = service?.unit ?? (units.has(requestedUnit) ? requestedUnit : 'UNIT')
  const totals = calculateQuoteLine(quantity, unitPriceHT, taxRate)
  const last = await prisma.quoteItem.findFirst({ where: { quoteId }, orderBy: { position: 'desc' } })

  await prisma.quoteItem.create({
    data: {
      quoteId,
      serviceId: service?.id ?? null,
      description,
      quantity,
      unit,
      unitPriceHT,
      costPriceHT: service?.costPriceHT ?? null,
      taxRate,
      ...totals,
      position: (last?.position ?? -1) + 1,
    },
  })

  await recalculateQuoteTotals(quoteId)
  revalidatePath(`/admin/devis/${quoteId}`)
  redirect(`/admin/devis/${quoteId}?saved=item-add`)
}

export async function updateQuoteItemAction(formData: FormData) {
  await guard()
  const itemId = text(formData, 'itemId')
  const item = await prisma.quoteItem.findUniqueOrThrow({ where: { id: itemId } })
  await editableQuote(item.quoteId)

  const quantity = Math.max(0, numberValue(formData, 'quantity', 1))
  const unitPriceHT = Math.max(0, numberValue(formData, 'unitPriceHT'))
  const taxRate = Math.max(0, numberValue(formData, 'taxRate', 20))
  const requestedUnit = text(formData, 'unit') as ServiceUnit
  const unit = units.has(requestedUnit) ? requestedUnit : item.unit
  const totals = calculateQuoteLine(quantity, unitPriceHT, taxRate)

  await prisma.quoteItem.update({
    where: { id: itemId },
    data: {
      description: text(formData, 'description'),
      quantity,
      unit,
      unitPriceHT,
      taxRate,
      ...totals,
    },
  })

  await recalculateQuoteTotals(item.quoteId)
  revalidatePath(`/admin/devis/${item.quoteId}`)
  redirect(`/admin/devis/${item.quoteId}?saved=item-update`)
}

export async function deleteQuoteItemAction(formData: FormData) {
  await guard()
  const itemId = text(formData, 'itemId')
  const item = await prisma.quoteItem.findUniqueOrThrow({ where: { id: itemId } })
  await editableQuote(item.quoteId)
  await prisma.quoteItem.delete({ where: { id: itemId } })
  await recalculateQuoteTotals(item.quoteId)
  revalidatePath(`/admin/devis/${item.quoteId}`)
  redirect(`/admin/devis/${item.quoteId}?saved=item-delete`)
}

export async function applyQuoteTaxContextAction(formData: FormData) {
  await guard()
  const quoteId = text(formData, 'quoteId')
  await editableQuote(quoteId)
  const requestedContext = text(formData, 'taxContext') as TaxContext
  const taxContext = contexts.has(requestedContext) ? requestedContext : 'OTHER'
  const items = await prisma.quoteItem.findMany({ where: { quoteId }, include: { service: { include: { taxRules: true } } } })

  await prisma.$transaction(async (tx) => {
    await tx.quote.update({ where: { id: quoteId }, data: { taxContext } })
    for (const item of items) {
      if (!item.service) continue
      const rule = item.service.taxRules.find((candidate) => candidate.context === taxContext)
      if (!rule) continue
      const taxRate = Number(rule.taxRate)
      const totals = calculateQuoteLine(Number(item.quantity), Number(item.unitPriceHT), taxRate)
      await tx.quoteItem.update({ where: { id: item.id }, data: { taxRate, ...totals } })
    }
  })

  await recalculateQuoteTotals(quoteId)
  revalidatePath(`/admin/devis/${quoteId}`)
  redirect(`/admin/devis/${quoteId}?saved=tax`)
}

export async function markQuoteSentAction(formData: FormData) {
  await guard()
  const quoteId = text(formData, 'quoteId')
  const quote = await editableQuote(quoteId)
  if (quoteExpired(quote.validUntil)) throw new Error('La date de validité est dépassée.')
  await recalculateQuoteTotals(quoteId)
  const itemCount = await prisma.quoteItem.count({ where: { quoteId } })
  if (!itemCount || Number(quote.totalTTC) <= 0) throw new Error('Ajoutez au moins une ligne avant l’envoi.')

  await prisma.quote.update({ where: { id: quoteId }, data: { status: 'SENT' } })
  revalidatePath('/admin/devis')
  revalidatePath(`/admin/devis/${quoteId}`)
  redirect(`/admin/devis/${quoteId}?saved=sent`)
}
