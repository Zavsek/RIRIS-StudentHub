import { useState } from 'react'
import { X } from 'lucide-react'
import type { CreateScheduleEntryData } from '../../models/schedule'
import { DAYS_OF_WEEK } from '../../lib/scheduleUtils'
import { Button } from '../ui/Button'

interface ScheduleEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateScheduleEntryData) => Promise<void>
}

export const ScheduleEntryModal = ({ isOpen, onClose, onSave }: ScheduleEntryModalProps) => {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Predavanja')
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [location, setLocation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Naziv termina je obvezen.')
      return
    }

    if (endTime <= startTime) {
      setError('Ura do mora biti večja od ure od.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        title: title.trim(),
        type,
        dayOfWeek,
        startTime,
        endTime,
        location: location.trim() ? location.trim() : null
      })
      setTitle('')
      setType('Predavanja')
      setLocation('')
      setStartTime('08:00')
      setEndTime('10:00')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Napaka pri shranjevanju termina.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-border w-full max-w-md shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50">
          <h3 className="font-bold text-text-main text-base uppercase tracking-wider">
            Dodaj nov termin v urnik
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-main p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-danger text-danger text-xs font-medium">
              {error}
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
              placeholder="npr. Osnove programiranja ali Samostojno učenje"
              className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                Tip obveznosti *
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary font-medium"
              >
                <option value="Predavanja">Predavanja (modra)</option>
                <option value="Vaje">Vaje (oranžna)</option>
                <option value="Drugo">Drugo</option>
              </select>
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
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.id} value={day.id}>
                    {day.name}
                  </option>
                ))}
              </select>
            </div>
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
              Lokacija / Predavalnica (opcijsko)
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="npr. Predavalnica Alfa ali Online (Zoom)"
              className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Prekliči
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Shranjevanje...' : 'Dodaj v urnik'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
