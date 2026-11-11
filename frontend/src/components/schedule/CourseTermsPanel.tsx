import { useEffect, useState } from 'react'
import { Plus, Check, Trash2, Clock, MapPin, Users, BookOpen } from 'lucide-react'
import { useScheduleStore } from '../../stores/scheduleStore'
import { DAYS_OF_WEEK } from '../../lib/scheduleUtils'
import { Button } from '../ui/Button'
import type { CreateCourseTermData } from '../../models/schedule'

interface CourseTermsPanelProps {
  courseId: number
  isModerator?: boolean
}

export const CourseTermsPanel = ({ courseId, isModerator = false }: CourseTermsPanelProps) => {
  const {
    courseTerms,
    fetchCourseTerms,
    importCourseTerm,
    createCourseTerm,
    deleteCourseTerm,
    isLoading
  } = useScheduleStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Predavanja')
  const [group, setGroup] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [location, setLocation] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)
  const [importingId, setImportingId] = useState<number | null>(null)

  useEffect(() => {
    fetchCourseTerms(courseId)
  }, [courseId, fetchCourseTerms])

  const handleImport = async (termId: number) => {
    setImportingId(termId)
    try {
      await importCourseTerm(termId)
    } finally {
      setImportingId(null)
    }
  }

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!title.trim()) {
      setModalError('Naziv termina je obvezen.')
      return
    }
    if (endTime <= startTime) {
      setModalError('Ura do mora biti večja od ure od.')
      return
    }

    try {
      const data: CreateCourseTermData = {
        title: title.trim(),
        type,
        group: group.trim() ? group.trim() : null,
        dayOfWeek,
        startTime,
        endTime,
        location: location.trim() ? location.trim() : null
      }
      await createCourseTerm(courseId, data)
      setIsModalOpen(false)
      setTitle('')
      setGroup('')
      setLocation('')
      setStartTime('08:00')
      setEndTime('10:00')
    } catch (err: any) {
      setModalError(err.message || 'Napaka pri ustvarjanju termina.')
    }
  }

  const handleDelete = async (termId: number, termTitle: string) => {
    if (confirm(`Ali res želiš izbrisati termin predmeta »${termTitle}«?`)) {
      await deleteCourseTerm(courseId, termId)
    }
  }

  return (
    <div className="bg-surface border border-border shadow-xs p-5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-text-main text-base uppercase tracking-wider">
              Predmetni urnik & Predloge terminov
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Izberite termine predavanj ter svojo skupino vaj in jih z enim klikom dodajte v svoj osebni urnik.
          </p>
        </div>

        {isModerator && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj termin predmeta</span>
          </Button>
        )}
      </div>

      {/* Terms List */}
      <div className="mt-4">
        {isLoading && courseTerms.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">Nalaganje terminov predmeta...</div>
        ) : courseTerms.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 border border-dashed border-border p-6 text-xs text-text-muted">
            Ta predmet še nima vnesenih privzetih terminov.
            {isModerator && ' Kot moderator lahko dodate termine predavanj in vaj.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courseTerms.map(term => {
              const dayName = DAYS_OF_WEEK.find(d => d.id === term.dayOfWeek)?.name ?? `Dan ${term.dayOfWeek}`
              const isLecture = term.type === 'Predavanja'
              const isLab = term.type === 'Vaje'

              return (
                <div
                  key={term.id}
                  className="border border-border p-3.5 bg-slate-50/50 flex flex-col justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                            isLecture
                              ? 'bg-primary text-white'
                              : isLab
                              ? 'bg-secondary text-white'
                              : 'bg-slate-600 text-white'
                          }`}
                        >
                          {term.type}
                        </span>
                        {term.group && (
                          <span className="text-[11px] font-semibold bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-sm flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {term.group}
                          </span>
                        )}
                      </div>

                      {isModerator && (
                        <button
                          type="button"
                          onClick={() => handleDelete(term.id, term.title)}
                          className="text-text-muted hover:text-danger p-1 transition-colors"
                          title="Izbriši termin predmeta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <h4 className="font-semibold text-text-main text-sm mt-2">
                      {term.title}
                    </h4>

                    <div className="mt-2 space-y-1 text-xs text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-text-main">{dayName}</span>
                        <span>({term.startTime} – {term.endTime})</span>
                      </div>
                      {term.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span>{term.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    {term.isInUserSchedule ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-sm flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        V tvojem urniku
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleImport(term.id)}
                        disabled={importingId === term.id}
                        className="text-xs font-semibold bg-primary text-white hover:bg-primary-hover px-3 py-1.5 rounded-sm transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {importingId === term.id ? 'Dodajanje...' : 'Dodaj v moj urnik'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Moderator Modal for adding course term */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border w-full max-w-md shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50">
              <h3 className="font-bold text-text-main text-base uppercase tracking-wider">
                Nov privzeti termin predmeta
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTerm} className="p-4 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border-l-4 border-danger text-danger text-xs font-medium">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Naziv termina *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="npr. Predavanja ali Laboratorijske vaje"
                  className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Tip *
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
                  >
                    <option value="Predavanja">Predavanja</option>
                    <option value="Vaje">Vaje</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Skupina (opcijsko)
                  </label>
                  <input
                    type="text"
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    placeholder="npr. Skupina 1"
                    className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Dan v tednu *
                </label>
                <select
                  value={dayOfWeek}
                  onChange={e => setDayOfWeek(Number(e.target.value))}
                  className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
                >
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Ura od *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Ura do *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Lokacija (opcijsko)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="npr. Predavalnica Alfa"
                  className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Prekliči
                </Button>
                <Button type="submit" variant="primary">
                  Dodaj termin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
