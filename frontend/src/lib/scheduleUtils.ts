export interface WeekDay {
  id: number
  name: string
  short: string
}

export const DAYS_OF_WEEK: WeekDay[] = [
  { id: 1, name: 'Ponedeljek', short: 'Pon' },
  { id: 2, name: 'Torek', short: 'Tor' },
  { id: 3, name: 'Sreda', short: 'Sre' },
  { id: 4, name: 'Četrtek', short: 'Čet' },
  { id: 5, name: 'Petek', short: 'Pet' },
  { id: 6, name: 'Sobota', short: 'Sob' },
  { id: 7, name: 'Nedelja', short: 'Ned' },
]

export function getDayName(dayId: number): string {
  return DAYS_OF_WEEK.find(d => d.id === dayId)?.name ?? `Dan ${dayId}`
}

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}
