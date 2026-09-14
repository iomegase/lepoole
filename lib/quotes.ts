import { prisma } from '@/lib/prisma'
import type { TaxContext } from '@prisma/client'
import { Prisma } from '@prisma/client'

function roundCents(value: number) {
  return Math.round(value * 100)
}

export function calculateQuoteLine(quantity: number, unitPriceHT: number, taxRate: number) {
  for (const value of [quantity, unitPriceHT, taxRate]) {
    if (!Number.isFinite(value) || value < 0 || new Prisma.Decimal(value).decimalPlaces() > 2) throw new Error('Montant ou quantité invalide (deux décimales maximum).')
  }
  if (taxRate > 100 || quantity > 99999999.99 || unitPriceHT > 99999999.99) throw new Error('Montant ou taux hors limites.')
  const totalHT = new Prisma.Decimal(quantity).mul(unitPriceHT).toDecimalPlaces(2)
  const totalTax = totalHT.mul(taxRate).div(100).toDecimalPlaces(2)
  const totalTTC = totalHT.add(totalTax)

  return {
    totalHT: totalHT.toNumber(),
    totalTax: totalTax.toNumber(),
    totalTTC: totalTTC.toNumber(),
  }
}

export async function recalculateQuoteTotals(quoteId: string) {
  const items = await prisma.quoteItem.findMany({ where: { quoteId } })

  const subtotalCents = items.reduce((sum, item) => sum + roundCents(Number(item.totalHT)), 0)
  const taxCents = items.reduce((sum, item) => sum + roundCents(Number(item.totalTax)), 0)
  const totalCents = items.reduce((sum, item) => sum + roundCents(Number(item.totalTTC)), 0)
  const taxCertificationRequired = items.some((item) => Number(item.taxRate) < 20)

  await prisma.quote.update({
    where: { id: quoteId },
    data: {
      subtotalHT: subtotalCents / 100,
      taxAmount: taxCents / 100,
      totalTTC: totalCents / 100,
      taxCertificationRequired,
    },
  })
}

export async function taxRateForService(serviceId: number, context: TaxContext) {
  const rule = await prisma.serviceTaxRule.findUnique({
    where: { serviceId_context: { serviceId, context } },
  })

  return rule ? Number(rule.taxRate) : 20
}
