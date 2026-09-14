'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'
import type { ServiceUnit, TaxContext } from '@prisma/client'

const units = new Set<ServiceUnit>(['UNIT', 'HOUR', 'METER', 'M2', 'FORFAIT', 'DAY'])
const taxFields: Array<[TaxContext, string, number]> = [
  ['NEW_CONSTRUCTION', 'taxNew', 20],
  ['RENOVATION_OVER_2_YEARS', 'taxRenovation', 10],
  ['RENOVATION_UNDER_2_YEARS', 'taxRecent', 20],
  ['ENERGY_RENOVATION', 'taxEnergy', 20],
  ['OTHER', 'taxOther', 20],
]

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

function getUnit(formData: FormData): ServiceUnit {
  const value = text(formData, 'unit') as ServiceUnit
  return units.has(value) ? value : 'UNIT'
}

function getTaxRules(formData: FormData) {
  return taxFields.map(([context, key, fallback]) => ({
    context,
    taxRate: numberValue(formData, key, fallback),
  }))
}

export async function createServiceCatalogAction(formData: FormData) {
  await guard()
  const name = text(formData, 'name')
  if (!name) redirect('/admin/catalogue?error=name')

  await prisma.serviceCatalog.create({
    data: {
      name,
      description: text(formData, 'description') || null,
      category: text(formData, 'category') || null,
      unit: getUnit(formData),
      unitPriceHT: numberValue(formData, 'unitPriceHT'),
      costPriceHT: text(formData, 'costPriceHT') ? numberValue(formData, 'costPriceHT') : null,
      sortOrder: numberValue(formData, 'sortOrder'),
      taxRules: { create: getTaxRules(formData) },
    },
  })

  revalidatePath('/admin/catalogue')
  redirect('/admin/catalogue?saved=create')
}

export async function updateServiceCatalogAction(formData: FormData) {
  await guard()
  const id = Number(formData.get('id'))
  const rules = getTaxRules(formData)

  await prisma.$transaction(async (tx) => {
    await tx.serviceCatalog.update({
      where: { id },
      data: {
        name: text(formData, 'name'),
        description: text(formData, 'description') || null,
        category: text(formData, 'category') || null,
        unit: getUnit(formData),
        unitPriceHT: numberValue(formData, 'unitPriceHT'),
        costPriceHT: text(formData, 'costPriceHT') ? numberValue(formData, 'costPriceHT') : null,
        sortOrder: numberValue(formData, 'sortOrder'),
      },
    })

    for (const rule of rules) {
      await tx.serviceTaxRule.upsert({
        where: { serviceId_context: { serviceId: id, context: rule.context } },
        create: { serviceId: id, context: rule.context, taxRate: rule.taxRate },
        update: { taxRate: rule.taxRate },
      })
    }
  })

  revalidatePath('/admin/catalogue')
  redirect('/admin/catalogue?saved=update')
}

export async function toggleServiceCatalogAction(formData: FormData) {
  await guard()
  const id = Number(formData.get('id'))
  const service = await prisma.serviceCatalog.findUniqueOrThrow({ where: { id } })
  await prisma.serviceCatalog.update({ where: { id }, data: { active: !service.active } })
  revalidatePath('/admin/catalogue')
  redirect('/admin/catalogue?saved=toggle')
}
