import { prisma } from '@/lib/prisma'

export async function nextDocumentNumber(prefix: 'DEM' | 'DEV') {
  const year = new Date().getFullYear()
  const id = `${prefix}-${year}`

  const sequence = await prisma.documentSequence.upsert({
    where: { id },
    create: { id, value: 1 },
    update: { value: { increment: 1 } },
  })

  return `${prefix}-${year}-${String(sequence.value).padStart(4, '0')}`
}
