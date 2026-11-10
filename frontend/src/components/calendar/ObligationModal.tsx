import { useState, useEffect } from 'react'
import { X, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import type { Obligation, ObligationType } from '../../models/calendar'
import { useCalendarStore } from '../../stores/calendarStore'

interface ObligationModalProps {
  courseId: number
  isOpen: boolean
  obligation?: Obligation | null
  initialDate?: Date | null
  onClose: () => void
}

export const ObligationModal = ({
  courseId,
  isOpen,
  obligation,
  initialDate,
  onClose
}: ObligationModalProps) => {
  const createObligation = useCalendarStore(state => state.createObligation)
  const updateObligation = useCalendarStore(state => state.updateObligation)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<ObligationType>('Kolokvij')
  const [dateStr, setDateStr] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (obligation) {
      setTitle(obligation.title)
      setType(obligation.type)
      const d = new Date(obligation.date)
      // Format to YYYY-MM-DDTHH:mm
      const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setDateStr(localIso)
      setDescription(obligation.description || '')
    } else {
      setTitle('')
      setType('Kolokvij')
      const target = initialDate ? new Date(initialDate) : new Date(Date.now() + 24 * 60 * 60 * 1000)
      target.setHours(9, 0, 0, 0)
      const localIso = new Date(target.getTime() - target.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setDateStr(localIso)
      setDescription('')
    }
    setError(null)
  }, [obligation, isOpen, initialDate])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Naslov obveznosti je obvezen.')
      return
    }
    if (!dateStr) {
      setError('Datum in ura obveznosti sta obvezna.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const utcDate = new Date(dateStr).toISOString()
      if (obligation) {
        await updateObligation(courseId, obligation.id, {
          title: title.trim(),
          type,
          date: utcDate,
          description: description.trim() || null
        })
      } else {
        await createObligation(courseId, {
          title: title.trim(),
          type,
          date: utcDate,
          description: description.trim() || null
        })
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Napaka pri shranjevanju obveznosti.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-border w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border bg-gray-50/50">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-primary" size={20} />
            <h3 className="font-bold text-text-main text-lg">
              {obligation ? 'Uredi obveznost' : 'Dodaj novo obveznost'}
            </h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Naslov obveznosti *
            </label>
            <input
              type="text"
              placeholder="Npr. 1. kolokvij iz vaj"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Tip obveznosti *
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ObligationType)}
                disabled={isSubmitting}
                className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
              >
                <option value="Kolokvij">Kolokvij</option>
                <option value="Izpit">Izpit</option>
                <option value="Oddaja">Oddaja</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Datum in čas roka *
              </label>
              <input
                type="datetime-local"
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Opis / navodila (opcijsko)
            </label>
            <textarea
              rows={3}
              placeholder="Npr. Obsega snov prvih štirih poglavij, dovoljena uporaba kalkulatorja..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-surface border border-border text-sm p-3 rounded-sm text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Prekliči
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Shranjevanje...' : obligation ? 'Posodobi obveznost' : 'Dodaj obveznost'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
