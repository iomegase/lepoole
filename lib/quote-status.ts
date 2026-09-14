export function quoteExpired(validUntil: Date | null, now = new Date()) {
  return validUntil !== null && validUntil.getTime() < now.getTime()
}

export function canAnswerQuote(quote: { status: string; validUntil: Date | null }, now = new Date()) {
  return ['SENT', 'VIEWED'].includes(quote.status) && !quoteExpired(quote.validUntil, now)
}

export function validityEnd(date: string) {
  const noon = new Date(`${date}T12:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(noon.getTime()) || noon.toISOString().slice(0, 10) !== date) {
    throw new Error('Date de validité incorrecte.')
  }
  const parisHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23' }).format(noon))
  return new Date(`${date}T${String(23 - (parisHour - 12)).padStart(2, '0')}:59:59.999Z`)
}
