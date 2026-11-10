export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfWeekInMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  // JavaScript getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  // We want: 0 = Mon, 1 = Tue, ..., 6 = Sun
  return day === 0 ? 6 : day - 1
}

export function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

export function getMonthName(month: number): string {
  const names = [
    'Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij',
    'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December'
  ]
  return names[month] || ''
}
