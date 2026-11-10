import { useState, useMemo } from 'react'
import { X, Clock, FileText, Send, MessageSquare } from 'lucide-react'
import { Button } from '../ui/Button'
import { useQaStore } from '../../stores/qaStore'
import { AnswerItem } from './AnswerItem'

interface QuestionThreadModalProps {
  isModerator: boolean
  onClose: () => void
}

export const QuestionThreadModal = ({ isModerator, onClose }: QuestionThreadModalProps) => {
  const activeQuestion = useQaStore(state => state.activeQuestion)
  const submitAnswer = useQaStore(state => state.submitAnswer)
  const deleteAnswer = useQaStore(state => state.deleteAnswer)

  const [newAnswerText, setNewAnswerText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const rootAnswers = useMemo(() => {
    if (!activeQuestion) return []
    return activeQuestion.answers.filter(a => !a.parentAnswerId)
  }, [activeQuestion])

  const repliesByParentId = useMemo(() => {
    if (!activeQuestion) return {}
    const map: Record<number, typeof activeQuestion.answers> = {}
    activeQuestion.answers.forEach(a => {
      if (a.parentAnswerId) {
        if (!map[a.parentAnswerId]) map[a.parentAnswerId] = []
        map[a.parentAnswerId].push(a)
      }
    })
    return map
  }, [activeQuestion])

  if (!activeQuestion) return null

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnswerText.trim()) return

    setIsSubmitting(true)
    try {
      await submitAnswer(activeQuestion.id, newAnswerText.trim())
      setNewAnswerText('')
    } catch (err: any) {
      alert(err.message || 'Napaka pri pošiljanju odgovora.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReplyToAnswer = async (content: string, parentAnswerId: number) => {
    await submitAnswer(activeQuestion.id, content, parentAnswerId)
  }

  const questionDate = new Date(activeQuestion.createdAt).toLocaleString('sl-SI', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-border w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gray-50/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-primary" size={20} />
            <h3 className="font-bold text-text-main text-lg truncate">Tema vprašanja</h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Question */}
          <div className="border-b border-border pb-5">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {activeQuestion.materialTitle && (
                <span className="bg-blue-50 text-primary border border-blue-200 text-xs px-2 py-0.5 rounded-sm font-medium flex items-center gap-1">
                  <FileText size={12} />
                  Gradivo: {activeQuestion.materialTitle}
                </span>
              )}
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Clock size={12} className="opacity-70" />
                {questionDate}
              </span>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs font-semibold text-text-main">{activeQuestion.authorName}</span>
            </div>

            <h2 className="text-xl font-bold text-text-main mb-3">{activeQuestion.title}</h2>
            <p className="text-sm text-text-main whitespace-pre-line bg-gray-50/50 p-4 border border-border/60">
              {activeQuestion.content}
            </p>
          </div>

          {/* Answers list */}
          <div>
            <h4 className="font-bold text-sm text-text-main uppercase tracking-wider mb-2">
              Odgovori ({activeQuestion.answers.length})
            </h4>

            {rootAnswers.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-sm border border-dashed border-border rounded-sm">
                Na to vprašanje še ni odgovorov. Bodi prvi in pomagaj sošolcu!
              </div>
            ) : (
              <div className="space-y-1">
                {rootAnswers.map(ans => (
                  <AnswerItem
                    key={ans.id}
                    answer={ans}
                    replies={repliesByParentId[ans.id] || []}
                    isModerator={isModerator}
                    onReply={handleReplyToAnswer}
                    onDeleteAnswer={deleteAnswer}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Post Form */}
        <form onSubmit={handlePostAnswer} className="p-4 border-t border-border bg-gray-50/50 flex gap-2">
          <input
            type="text"
            placeholder="Napišite svoj odgovor na vprašanje..."
            value={newAnswerText}
            onChange={e => setNewAnswerText(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 bg-surface border border-border text-sm px-4 py-2.5 rounded-sm focus:outline-none focus:border-primary"
          />
          <Button type="submit" variant="primary" disabled={isSubmitting || !newAnswerText.trim()} className="flex items-center gap-1.5 shrink-0">
            <Send size={15} />
            Odgovori
          </Button>
        </form>
      </div>
    </div>
  )
}
