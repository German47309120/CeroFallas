const GUATEMALA_TIME_ZONE = 'America/Guatemala'

function partsFor(date, fields) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: GUATEMALA_TIME_ZONE,
    ...fields,
  }).formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
}

export function guatemalaDateInputValue(date = new Date()) {
  const { year, month, day } = partsFor(date, { year: 'numeric', month: '2-digit', day: '2-digit' })
  return `${year}-${month}-${day}`
}

export function guatemalaTimeInputValue(date = new Date()) {
  const { hour, minute } = partsFor(date, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  return `${hour}:${minute}`
}
