import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateQuoteLine } from '../lib/quotes'
import { canAnswerQuote, validityEnd } from '../lib/quote-status'

test('calcul des montants et arrondis par ligne', () => {
  assert.deepEqual(calculateQuoteLine(2.5, 19.99, 10), { totalHT: 49.98, totalTax: 5, totalTTC: 54.98 })
  assert.deepEqual(calculateQuoteLine(1, 0.1, 5.5), { totalHT: 0.1, totalTax: 0.01, totalTTC: 0.11 })
  assert.deepEqual(calculateQuoteLine(3, 0.29, 20), { totalHT: 0.87, totalTax: 0.17, totalTTC: 1.04 })
  for (const args of [[1, -10, 20], [1, 10, 101], [NaN, 10, 20], [1.005, 10, 20]]) {
    assert.throws(() => calculateQuoteLine(...args as [number, number, number]))
  }
})

test('les devis expirés, brouillons et déjà répondus ne sont pas acceptables', () => {
  const now = new Date('2026-09-14T12:00:00Z')
  for (const status of ['DRAFT', 'ACCEPTED', 'REJECTED', 'EXPIRED']) assert.equal(canAnswerQuote({ status, validUntil: null }, now), false)
  assert.equal(canAnswerQuote({ status: 'SENT', validUntil: new Date('2026-09-13') }, now), false)
  assert.equal(canAnswerQuote({ status: 'VIEWED', validUntil: new Date('2026-09-15') }, now), true)
})

test('validité jusqu’à la fin du jour en France, été et hiver', () => {
  assert.equal(validityEnd('2026-09-14').toISOString(), '2026-09-14T21:59:59.999Z')
  assert.equal(validityEnd('2026-12-14').toISOString(), '2026-12-14T22:59:59.999Z')
  assert.throws(() => validityEnd('2026-02-30'))
})
