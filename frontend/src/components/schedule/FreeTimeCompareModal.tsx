import { useState, useEffect } from 'react'
import { X, Users, Clock, AlertCircle, CheckCircle2, ArrowLeft, ChevronRight } from 'lucide-react'
import { useScheduleStore } from '../../stores/scheduleStore'
import { useAuthStore } from '../../stores/authStore'
import { DAYS_OF_WEEK, timeToMinutes, formatDuration } from '../../lib/scheduleUtils'
import { Button } from '../ui/Button'

interface FreeTimeCompareModalProps {
  isOpen: boolean
  onClose: () => void
  initialCourseId?: number
}

const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i) // 8:00 to 20:00
const HOUR_HEIGHT = 50 // px per hour
const START_MINUTES = 8 * 60 // 480 min

export const FreeTimeCompareModal = ({
  isOpen,
  onClose,
  initialCourseId
}: FreeTimeCompareModalProps) => {
  const { user } = useAuthStore()
  const {
    colleagues,
    fetchColleagues,
    weeklyComparisonResult,
    compareWeeklySchedule,
    clearComparison,
    isLoading
  } = useScheduleStore()

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [viewMode, setViewMode] = useState<'select' | 'compare'>('select')
  const [showWeekend, setShowWeekend] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      clearComparison()
      setValidationError(null)
      setViewMode('select')
      setIsMultiSelectMode(false)
      fetchColleagues(initialCourseId)
      if (user?.id) {
        setSelectedUserIds([user.id])
      }
    }
  }, [isOpen, initialCourseId, user?.id, clearComparison, fetchColleagues])

  if (!isOpen) return null

  // 1-click comparison with a colleague for the whole week
  const handleDirectUserClick = async (colleagueId: number) => {
    if (!user?.id) return
    const ids = [user.id, colleagueId]
    setSelectedUserIds(ids)
    setValidationError(null)

    try {
      await compareWeeklySchedule(ids)
      setViewMode('compare')
    } catch (err: any) {
      setValidationError(err.message || 'Napaka pri primerjavi urnika.')
    }
  }

  // Multi-select toggle
  const handleToggleMultiUser = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const handleRunMultiCompare = async () => {
    if (selectedUserIds.length < 2) {
      setValidationError('Izbrati morate vsaj dva uporabnika za primerjavo.')
      return
    }

    try {
      await compareWeeklySchedule(selectedUserIds)
      setViewMode('compare')
    } catch (err: any) {
      setValidationError(err.message || 'Napaka pri primerjavi urnika.')
    }
  }

  const visibleDays = showWeekend ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5)

  // Safe read with default fallback to avoid any undefined errors
  const comparedUsers = weeklyComparisonResult?.userSchedules ?? []
  const weeklyFree = weeklyComparisonResult?.weeklyFreeIntervals ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-surface border border-border w-full max-w-5xl shadow-2xl flex flex-col my-4 max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            {viewMode === 'compare' ? (
              <button
                type="button"
                onClick={() => setViewMode('select')}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary-hover mr-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Nazaj na sošolce</span>
              </button>
            ) : (
              <Users className="w-5 h-5 text-primary" />
            )}
            <h3 className="font-bold text-text-main text-base uppercase tracking-wider">
              {viewMode === 'compare' ? 'Tedenska primerjava urnika' : 'Primerjava prostega časa s sošolci'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-main p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {validationError && (
            <div className="p-3 bg-red-50 border-l-4 border-danger text-danger text-xs font-medium">
              {validationError}
            </div>
          )}

          {/* VIEW 1: CLEAN LIST OF USERS (No dropdowns, 1-click select, "Izberi več" toggle) */}
          {viewMode === 'select' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <h4 className="text-sm font-bold text-text-main uppercase tracking-wider">
                    {isMultiSelectMode ? 'Večkratna izbira sošolcev' : 'Izberite sošolca za primerjavo'}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    {isMultiSelectMode
                      ? 'Izberite poljubno število sošolcev za skupinsko analizo.'
                      : 'Kliknite na sošolca in takoj se odpre celotedenski primerjalni urnik z obarvanimi predavanji in vajami.'}
                  </p>
                </div>

                <Button
                  type="button"
                  variant={isMultiSelectMode ? 'primary' : 'outline'}
                  onClick={() => setIsMultiSelectMode(prev => !prev)}
                  className="text-xs py-1.5 px-3 shrink-0"
                >
                  {isMultiSelectMode ? 'Enostaven klik' : 'Izberi več'}
                </Button>
              </div>

              {/* List of colleagues */}
              <div className="border border-border divide-y divide-border bg-slate-50/40">
                {colleagues.length === 0 ? (
                  <div className="p-10 text-center text-xs text-text-muted">
                    {isLoading ? 'Nalaganje seznama sošolcev...' : 'Ni najdenih sošolcev pri vaših vpisanih predmetih.'}
                  </div>
                ) : (
                  colleagues.map(student => {
                    const isChecked = selectedUserIds.includes(student.id)

                    if (isMultiSelectMode) {
                      return (
                        <label
                          key={student.id}
                          className="flex items-center justify-between p-3.5 hover:bg-slate-100/70 cursor-pointer text-xs select-none transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleMultiUser(student.id)}
                              className="w-4 h-4 text-primary rounded-xs border-border cursor-pointer"
                            />
                            <div>
                              <span className="font-semibold text-text-main block text-sm">
                                {student.name}
                              </span>
                              <span className="text-[11px] text-text-muted">
                                {student.email}
                              </span>
                            </div>
                          </div>
                          {isChecked && (
                            <span className="text-[11px] font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-sm">
                              Izbrano
                            </span>
                          )}
                        </label>
                      )
                    }

                    // 1-click mode
                    return (
                      <div
                        key={student.id}
                        onClick={() => handleDirectUserClick(student.id)}
                        className="flex items-center justify-between p-3.5 hover:bg-primary-soft/40 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 text-primary font-bold rounded-xs flex items-center justify-center text-sm border border-primary/20">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-text-main block text-sm group-hover:text-primary transition-colors">
                              {student.name}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              {student.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                          <span>Primerjaj urnik</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {isMultiSelectMode && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-text-muted font-medium">
                    Izbrano: {selectedUserIds.length} uporabnikov
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRunMultiCompare}
                    disabled={selectedUserIds.length < 2 || isLoading}
                    className="flex items-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{isLoading ? 'Primerjanje...' : 'Primerjaj izbrane'}</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: WEEKLY COMPARISON SCHEDULE GRID (All days, color-coded for each user & type) */}
          {viewMode === 'compare' && weeklyComparisonResult && (
            <div className="space-y-4">
              {/* Controls bar & Clear Color Legend for Users & Types */}
              <div className="p-3 bg-slate-50 border border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Uporabniki */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold uppercase tracking-wider text-text-muted text-[11px]">
                      Uporabnika:
                    </span>
                    {comparedUsers.map(u => {
                      const isMe = u.userId === user?.id
                      return (
                        <div key={u.userId} className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border ${
                            isMe ? 'bg-primary text-white border-primary' : 'bg-purple-700 text-white border-purple-800'
                          }`}>
                            {isMe ? 'Jaz' : u.userName.split(' ')[0]}
                          </span>
                          <span className="font-semibold text-text-main">
                            {isMe ? `${u.userName} (Jaz)` : u.userName}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="w-px h-4 bg-border hidden md:block" />

                  {/* Tipi: Predavanja / Vaje */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold uppercase tracking-wider text-text-muted text-[11px]">
                      Tipi:
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-primary text-white">
                        PREDAVANJA
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-secondary text-white">
                        VAJE
                      </span>
                    </div>
                  </div>

                  <div className="w-px h-4 bg-border hidden md:block" />

                  {/* Prosti čas */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-emerald-500 rounded-xs"></span>
                    <span className="font-bold text-emerald-800">Skupni prosti čas</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWeekend(prev => !prev)}
                  className="text-xs text-primary hover:text-primary-hover font-medium underline cursor-pointer self-start md:self-auto"
                >
                  {showWeekend ? 'Skrij vikend (Pon–Pet)' : 'Prikaži vikend (Sob–Ned)'}
                </button>
              </div>

              {/* Weekly schedule grid with both users' events */}
              <div className="border border-border bg-surface overflow-x-auto shadow-xs">
                <div className="min-w-[760px]">
                  {/* Days header */}
                  <div
                    className="grid border-b border-border bg-slate-100/70"
                    style={{ gridTemplateColumns: `60px repeat(${visibleDays.length}, 1fr)` }}
                  >
                    <div className="p-2 text-center text-xs font-semibold text-text-muted border-r border-border">
                      Ura
                    </div>
                    {visibleDays.map(day => (
                      <div
                        key={day.id}
                        className="p-2 text-center text-xs font-bold uppercase tracking-wider text-text-main border-r border-border last:border-r-0"
                      >
                        {day.name}
                      </div>
                    ))}
                  </div>

                  {/* Hours and columns grid */}
                  <div
                    className="grid relative"
                    style={{ gridTemplateColumns: `60px repeat(${visibleDays.length}, 1fr)` }}
                  >
                    {/* Time labels column */}
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
                      return (
                        <div
                          key={day.id}
                          className="relative border-r border-border last:border-r-0 bg-surface"
                          style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}
                        >
                          {/* Hour guide lines */}
                          {HOURS.map(hour => (
                            <div
                              key={hour}
                              className="border-b border-border/40 absolute left-0 right-0 pointer-events-none"
                              style={{ top: `${(hour - 8) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                            />
                          ))}

                          {/* Render all users' slots for this day */}
                          {comparedUsers.map((u, userIdx) => {
                            const isMe = u.userId === user?.id
                            const userDayEntries = (u.entries ?? []).filter(e => e.dayOfWeek === day.id)

                            return userDayEntries.map(entry => {
                              const startMin = timeToMinutes(entry.startTime)
                              const endMin = timeToMinutes(entry.endTime)
                              const top = Math.max(0, ((startMin - START_MINUTES) / 60) * HOUR_HEIGHT)
                              const height = Math.max(26, ((endMin - startMin) / 60) * HOUR_HEIGHT - 2)

                              // Determine if Lecture or Lab
                              const isLab = entry.type === 'Vaje' || entry.title.toLowerCase().includes('vaje')
                              const isLecture = entry.type === 'Predavanja' || (!isLab && !entry.type) || entry.title.toLowerCase().includes('predavan')
                              const displayType = isLab ? 'Vaje' : isLecture ? 'Predavanja' : (entry.type || 'Drugo')

                              // Clear, high-contrast block styles:
                              // - If ME: Blue for Lecture, Orange for Lab
                              // - If COLLEAGUE: Purple for Lecture, Amber for Lab
                              const blockStyle = isMe
                                ? isLab
                                  ? 'bg-orange-50/95 border-l-4 border-secondary text-orange-950 border border-secondary/35'
                                  : 'bg-primary-soft/95 border-l-4 border-primary text-primary border border-primary/25'
                                : isLab
                                ? 'bg-amber-50/95 border-l-4 border-amber-600 text-amber-950 border border-amber-300'
                                : 'bg-purple-50/95 border-l-4 border-purple-600 text-purple-950 border border-purple-300'

                              const typeBadgeStyle = isLab
                                ? 'bg-secondary text-white'
                                : isLecture
                                ? 'bg-primary text-white'
                                : 'bg-slate-600 text-white'

                              const userBadgeStyle = isMe
                                ? 'bg-primary text-white'
                                : 'bg-purple-700 text-white'

                              // Offset 2 users side-by-side if they are at the same time
                              const isSecondUser = userIdx % 2 === 1
                              const widthStyle = comparedUsers.length > 1
                                ? (isSecondUser ? 'left-[50%] right-0.5' : 'left-0.5 right-[50%]')
                                : 'left-1 right-1'

                              return (
                                <div
                                  key={`${u.userId}-${entry.id}`}
                                  className={`absolute ${widthStyle} p-1.5 shadow-xs flex flex-col justify-between overflow-hidden ${blockStyle} hover:z-20 transition-all`}
                                  style={{ top: `${top}px`, height: `${height}px` }}
                                  title={`${isMe ? 'Jaz' : u.userName} [${displayType}]: ${entry.title} (${entry.startTime} - ${entry.endTime})`}
                                >
                                  <div>
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded-xs ${userBadgeStyle}`}>
                                        {isMe ? 'Jaz' : u.userName.split(' ')[0]}
                                      </span>
                                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded-xs ${typeBadgeStyle}`}>
                                        {displayType}
                                      </span>
                                    </div>
                                    <span className="font-semibold text-[10px] leading-tight block truncate mt-1">
                                      {entry.title}
                                    </span>
                                  </div>
                                  <span className="text-[9px] opacity-80 font-medium block">
                                    {entry.startTime}–{entry.endTime}
                                  </span>
                                </div>
                              )
                            })
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Weekly Free Time Breakdown (US-11 criteria per day for the entire week) */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-main">
                    Skupni prosti čas po dnevih (08:00 – 20:00)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {visibleDays.map(day => {
                    const dayData = weeklyFree.find(d => d.dayOfWeek === day.id)
                    const intervals = dayData?.freeIntervals ?? []

                    return (
                      <div
                        key={day.id}
                        className="border border-border p-3 bg-slate-50/60 flex flex-col justify-between"
                      >
                        <div>
                          <span className="font-bold text-xs text-text-main block uppercase pb-1.5 border-b border-border/60">
                            {day.name}
                          </span>

                          <div className="mt-2 space-y-1.5">
                            {intervals.length === 0 ? (
                              <div className="text-[11px] text-amber-700 bg-amber-50 p-2 border-l-2 border-amber-500 font-medium">
                                Ni skupnega prostega časa
                              </div>
                            ) : (
                              intervals.map((iv, i) => (
                                <div
                                  key={i}
                                  className="text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-900 p-1.5 rounded-xs flex items-center justify-between"
                                >
                                  <span className="font-semibold">{iv.startTime}–{iv.endTime}</span>
                                  <span className="text-[10px] font-bold text-emerald-700">{formatDuration(iv.durationMinutes)}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-border flex items-center justify-between shrink-0">
          {viewMode === 'compare' ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewMode('select')}
              className="flex items-center gap-1.5 text-xs py-1.5 px-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Izberi drugega sošolca</span>
            </Button>
          ) : <div />}

          <Button type="button" variant="outline" onClick={onClose} className="text-xs py-1.5 px-4">
            Zapri
          </Button>
        </div>
      </div>
    </div>
  )
}
