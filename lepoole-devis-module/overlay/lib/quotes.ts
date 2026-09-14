import { prisma } from '@/lib/prisma'
import type { TaxContext } from '@prisma/client'

function roundCents(value: number) {
  return Math.round(value * 100)
}

export function calculateQuoteLine(quantity: number, unitPriceHT: number, taxRate: number) {
  const totalHTCents = Math.round(quantity * roundCents(unitPriceHT))
  const totalTaxCents = Math.round(totalHTCents * taxRate / 100)
  const totalTTCCents = totalHTCents + totalTaxCents

  return {
    totalHT: totalHTCents / 100,
    totalTax: totalTaxCents / 100,
    totalTTC: totalTTCCents / 100,
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
