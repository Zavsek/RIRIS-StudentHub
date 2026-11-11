import { useState, useMemo } from 'react'
import { Trash2, MapPin, Clock } from 'lucide-react'
import type { ScheduleEntry } from '../../models/schedule'
import { DAYS_OF_WEEK, timeToMinutes } from '../../lib/scheduleUtils'

interface WeeklyScheduleGridProps {
  entries: ScheduleEntry[]
  onDelete?: (id: number) => void
}

const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i) // 8 to 20
const HOUR_HEIGHT = 60 // px per hour
const START_MINUTES = 8 * 60 // 08:00 = 480 min

export const WeeklyScheduleGrid = ({ entries, onDelete }: WeeklyScheduleGridProps) => {
  const [showWeekend, setShowWeekend] = useState(() =>
    entries.some(e => e.dayOfWeek === 6 || e.dayOfWeek === 7)
  )

  const visibleDays = useMemo(() => {
    return showWeekend ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5)
  }, [showWeekend])

  const entriesByDay = useMemo(() => {
    const map: Record<number, ScheduleEntry[]> = {}
    for (let i = 1; i <= 7; i++) map[i] = []
    entries.forEach(entry => {
      if (map[entry.dayOfWeek]) {
        map[entry.dayOfWeek].push(entry)
      }
    })
    return map
  }, [entries])

  return (
    <div className="bg-surface border border-border shadow-xs">
      {/* Grid header controls & legend */}
      <div className="p-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Tedenski pregled (08:00 – 20:00)
            </span>
          </div>

          {/* Color legend for lectures and labs */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-primary rounded-xs inline-block"></span>
              <span className="font-semibold text-text-main">Predavanja</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-secondary rounded-xs inline-block"></span>
              <span className="font-semibold text-text-main">Vaje</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowWeekend(prev => !prev)}
          className="text-xs text-primary hover:text-primary-hover font-medium underline cursor-pointer self-start sm:self-auto"
        >
          {showWeekend ? 'Skrij vikend (Pon–Pet)' : 'Prikaži vikend (Sob–Ned)'}
        </button>
      </div>

      {/* Grid container with horizontal scroll on small screens */}
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Day column headers */}
          <div className="grid border-b border-border bg-slate-100/70" style={{ gridTemplateColumns: `70px repeat(${visibleDays.length}, 1fr)` }}>
            <div className="p-2.5 text-center text-xs font-semibold text-text-muted border-r border-border">
              Ura
            </div>
            {visibleDays.map(day => (
              <div
                key={day.id}
                className="p-2.5 text-center text-xs font-semibold uppercase tracking-wider text-text-main border-r border-border last:border-r-0"
              >
                <span>{day.name}</span>
                <span className="block text-[10px] text-text-muted font-normal">
                  {entriesByDay[day.id]?.length || 0} terminov
                </span>
              </div>
            ))}
          </div>

          {/* Time grid body */}
          <div className="grid relative" style={{ gridTemplateColumns: `70px repeat(${visibleDays.length}, 1fr)` }}>
            {/* Hour labels column */}
            <div className="border-r border-border select-none">
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="border-b border-border text-[11px] text-text-muted px-2 py-1 flex items-start justify-end"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                >
                  <span className="-translate-y-2">{`${String(hour).padStart(2, '0')}:00`}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {visibleDays.map(day => {
              const dayEntries = entriesByDay[day.id] || []
              return (
                <div
                  key={day.id}
                  className="relative border-r border-border last:border-r-0 bg-surface"
                  style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}
                >
                  {/* Horizontal grid guide lines */}
                  {HOURS.map(hour => (
                    <div
                      key={hour}
                      className="border-b border-border/40 absolute left-0 right-0 pointer-events-none"
                      style={{ top: `${(hour - 8) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                    />
                  ))}

                  {/* Scheduled slots */}
                  {dayEntries.map(entry => {
                    const startMin = timeToMinutes(entry.startTime)
                    const endMin = timeToMinutes(entry.endTime)
                    const top = Math.max(0, ((startMin - START_MINUTES) / 60) * HOUR_HEIGHT)
                    const height = Math.max(28, ((endMin - startMin) / 60) * HOUR_HEIGHT - 2)

                    const isLab = entry.type === 'Vaje' || entry.title.toLowerCase().includes('vaje')
                    const isLecture = entry.type === 'Predavanja' || (!isLab && !entry.type) || entry.title.toLowerCase().includes('predavan')

                    const containerStyles = isLab
                      ? 'bg-orange-50/95 border-l-4 border-secondary border border-orange-200/70 text-orange-950'
                      : isLecture
                      ? 'bg-primary-soft/95 border-l-4 border-primary border border-primary/25 text-primary'
                      : 'bg-slate-100 border-l-4 border-slate-600 border border-slate-200 text-slate-800'

                    const typeBadgeBg = isLab
                      ? 'bg-secondary text-white'
                      : isLecture
                      ? 'bg-primary text-white'
                      : 'bg-slate-600 text-white'

                    const displayType = isLab ? 'Vaje' : isLecture ? 'Predavanja' : (entry.type || 'Drugo')

                    return (
                      <div
                        key={entry.id}
                        className={`absolute left-1 right-1 p-2 shadow-xs flex flex-col justify-between overflow-hidden group hover:z-20 transition-all ${containerStyles}`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        title={`${entry.title} [${displayType}] (${entry.startTime} - ${entry.endTime})`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-xs ${typeBadgeBg}`}>
                                {displayType}
                              </span>
                              <span className="font-semibold text-xs leading-tight line-clamp-1">
                                {entry.title}
                              </span>
                            </div>
                            {onDelete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm(`Ali res želiš izbrisati termin »${entry.title}«?`)) {
                                    onDelete(entry.id)
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger p-0.5 transition-opacity"
                                title="Izbriši termin"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="text-[10px] text-text-muted font-medium mt-0.5 flex items-center gap-1">
                            <span>{entry.startTime} – {entry.endTime}</span>
                          </div>
                        </div>

                        {entry.location && height >= 54 && (
                          <div className="text-[10px] text-text-muted flex items-center gap-1 truncate mt-0.5">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{entry.location}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
