import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react'
import type { Obligation } from '../../models/calendar'
import { getDaysInMonth, getFirstDayOfWeekInMonth, formatDateKey, getMonthName } from '../../lib/calendarUtils'
import { ObligationCard } from './ObligationCard'
import { Button } from '../ui/Button'

interface CalendarGridViewProps {
  obligations: Obligation[]
  isModerator?: boolean
  showCourseName?: boolean
  onEdit?: (obligation: Obligation) => void
  onDelete?: (obligationId: number) => void
  onAdd?: (date?: Date) => void
}

const WEEKDAYS = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned']

export const CalendarGridView = ({
  obligations,
  isModerator = false,
  showCourseName = false,
  onEdit,
  onDelete,
  onAdd
}: CalendarGridViewProps) => {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDateKey(formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()))
  }

  // Map obligations by YYYY-MM-DD
  const obligationsByDate = useMemo(() => {
    const map: Record<string, Obligation[]> = {}
    obligations.forEach(ob => {
      const d = new Date(ob.date)
      const key = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
      if (!map[key]) map[key] = []
      map[key].push(ob)
    })
    return map
  }, [obligations])

  const totalDays = getDaysInMonth(year, month)
  const firstDayOffset = getFirstDayOfWeekInMonth(year, month)

  const today = new Date()
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const selectedObligations = selectedDateKey ? obligationsByDate[selectedDateKey] || [] : []

  return (
    <div className="space-y-6">
      {/* Koledarska navigacijska vrstica */}
      <div className="bg-surface border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-text-main">
            {getMonthName(month)} {year}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 border border-border hover:bg-gray-100 rounded-sm text-text-main transition-colors"
            title="Prejšnji mesec"
          >
            <ChevronLeft size={18} />
          </button>
          
          <button
            onClick={handleToday}
            className="px-3 py-1.5 border border-border hover:bg-gray-100 text-xs font-semibold rounded-sm text-text-main transition-colors"
          >
            Danes
          </button>

          <button
            onClick={handleNextMonth}
            className="p-1.5 border border-border hover:bg-gray-100 rounded-sm text-text-main transition-colors"
            title="Naslednji mesec"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Koledarska mreža */}
      <div className="bg-surface border border-border overflow-hidden">
        {/* Dnevi v tednu */}
        <div className="grid grid-cols-7 border-b border-border bg-gray-50/70 text-center text-xs font-bold text-text-muted uppercase tracking-wider py-2">
          {WEEKDAYS.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Mesečne celice */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border">
          {/* Prazna polja pred 1. dnem */}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[110px] bg-gray-50/30 p-1.5 opacity-40" />
          ))}

          {/* Dnevi meseca */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1
            const dateKey = formatDateKey(year, month, dayNum)
            const dayObs = obligationsByDate[dateKey] || []
            const isToday = dateKey === todayKey
            const isSelected = dateKey === selectedDateKey

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDateKey(dateKey)}
                className={`min-h-[90px] sm:min-h-[110px] p-1.5 transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/70 ring-2 ring-primary ring-inset'
                    : isToday
                    ? 'bg-amber-50/40 hover:bg-gray-50'
                    : 'bg-surface hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-sm ${
                    isToday ? 'bg-primary text-white' : 'text-text-main'
                  }`}>
                    {dayNum}
                  </span>

                  {dayObs.length > 0 && (
                    <span className="text-[10px] text-text-muted font-bold">
                      {dayObs.length}
                    </span>
                  )}
                </div>

                {/* Značke obveznosti v dnevu */}
                <div className="space-y-1 overflow-hidden flex-1">
                  {dayObs.slice(0, 2).map(ob => {
                    const badgeClass =
                      ob.type === 'Izpit' ? 'bg-red-50 text-red-700 border-red-200' :
                      ob.type === 'Kolokvij' ? 'bg-blue-50 text-primary border-blue-200' :
                      'bg-orange-50 text-secondary border-orange-200'

                    return (
                      <div
                        key={ob.id}
                        className={`text-[11px] truncate px-1.5 py-0.5 rounded-sm border font-medium leading-tight ${badgeClass}`}
                        title={`${ob.type}: ${ob.title}`}
                      >
                        {ob.title}
                      </div>
                    )
                  })}
                  {dayObs.length > 2 && (
                    <div className="text-[10px] text-text-muted font-semibold pl-1">
                      +{dayObs.length - 2} več
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Podrobnosti za izbrani dan */}
      {selectedDateKey && (
        <div className="bg-surface border border-border p-5 space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <div>
              <h4 className="text-lg font-bold text-text-main">
                Obveznosti za {new Date(selectedDateKey).toLocaleDateString('sl-SI', { day: '2-digit', month: 'long', year: 'numeric' })}
              </h4>
              <p className="text-xs text-text-muted">
                {selectedObligations.length === 0 ? 'Za ta dan ni vnesenih obveznosti.' : `Število obveznosti: ${selectedObligations.length}`}
              </p>
            </div>

            {isModerator && onAdd && (
              <Button
                onClick={() => onAdd(new Date(selectedDateKey))}
                className="text-xs px-3 py-1.5 h-auto flex items-center gap-1.5"
              >
                <Plus size={14} />
                Dodaj rok za ta dan
              </Button>
            )}
          </div>

          {selectedObligations.length > 0 ? (
            <div className="space-y-3">
              {selectedObligations.map(ob => (
                <ObligationCard
                  key={ob.id}
                  obligation={ob}
                  isModerator={isModerator}
                  showCourseName={showCourseName}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-text-muted border border-dashed border-border rounded-sm">
              Na ta datum ni predvidenih nobenih kolokvijev, izpitov ali oddaj.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
