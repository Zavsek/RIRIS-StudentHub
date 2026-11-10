import { useState } from 'react'
import { X, HelpCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import type { Material } from '../../models/material'
import { useQaStore } from '../../stores/qaStore'

interface CreateQuestionModalProps {
  courseId: number
  isOpen: boolean
  materials: Material[]
  onClose: () => void
}

export const CreateQuestionModal = ({
  courseId,
  isOpen,
  materials,
  onClose
}: CreateQuestionModalProps) => {
  const createQuestion = useQaStore(state => state.createQuestion)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [materialId, setMaterialId] = useState<number | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Naslov in opis vprašanja sta obvezna.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await createQuestion(courseId, {
        title: title.trim(),
        content: content.trim(),
        materialId: materialId || null
      })
      setTitle('')
      setContent('')
      setMaterialId(undefined)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Napaka pri objavi vprašanja.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-border w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border bg-gray-50/50">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-primary" size={20} />
            <h3 className="font-bold text-text-main text-lg">Zastavi novo vprašanje</h3>
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
              Naslov vprašanja *
            </label>
            <input
              type="text"
              placeholder="Npr. Razlika med procesom in nitjo"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Povezano gradivo (opcijsko)
            </label>
            <select
              value={materialId || ''}
              onChange={e => setMaterialId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              disabled={isSubmitting}
              className="w-full bg-surface border border-border text-sm px-3 py-2 rounded-sm text-text-main focus:outline-none focus:border-primary"
            >
              <option value="">-- Ni povezano z gradivom --</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.fileName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Podroben opis vprašanja *
            </label>
            <textarea
              rows={5}
              placeholder="Opišite kaj točno vam ni jasno ali pri kateri nalogi se je zataknilo..."
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-surface border border-border text-sm p-3 rounded-sm text-text-main focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Prekliči
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Objavljanje...' : 'Objavi vprašanje'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
