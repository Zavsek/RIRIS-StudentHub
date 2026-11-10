import { MessageSquare, Clock, FileText, Trash2 } from 'lucide-react'
import type { Question } from '../../models/qa'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'

interface QuestionCardProps {
  question: Question
  isModerator: boolean
  onOpenThread: (questionId: number) => void
  onDeleteQuestion: (questionId: number) => void
}

export const QuestionCard = ({
  question,
  isModerator,
  onOpenThread,
  onDeleteQuestion
}: QuestionCardProps) => {
  const currentUserId = useAuthStore(state => state.user?.id)
  const isAuthor = currentUserId === question.authorId
  const canDelete = isAuthor || isModerator

  const date = new Date(question.createdAt).toLocaleDateString('sl-SI', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className="bg-surface border border-border p-5 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {question.materialTitle && (
              <span className="bg-blue-50 text-primary border border-blue-200 text-xs px-2 py-0.5 rounded-sm font-medium flex items-center gap-1">
                <FileText size={12} />
                {question.materialTitle}
              </span>
            )}
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock size={12} className="opacity-70" />
              {date}
            </span>
            <span className="text-xs text-text-muted">•</span>
            <span className="text-xs font-medium text-text-main">{question.authorName}</span>
          </div>

          <h3 
            onClick={() => onOpenThread(question.id)}
            className="text-lg font-bold text-text-main hover:text-primary cursor-pointer transition-colors mb-2"
          >
            {question.title}
          </h3>

          <p className="text-sm text-text-muted line-clamp-2 mb-4 whitespace-pre-line">
            {question.content}
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
            <span className="flex items-center gap-1.5 text-primary">
              <MessageSquare size={14} />
              {question.answersCount} {question.answersCount === 1 ? 'odgovor' : question.answersCount === 2 ? 'odgovora' : 'odgovorov'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Button 
            onClick={() => onOpenThread(question.id)}
            variant="outline" 
            className="text-xs px-3 py-1.5 h-auto"
          >
            Prikaži odgovore
          </Button>

          {canDelete && (
            <button
              onClick={() => onDeleteQuestion(question.id)}
              className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center mt-1"
              title={isAuthor ? 'Izbriši vprašanje' : 'Izbriši vprašanje kot moderator'}
            >
              <Trash2 size={12} className="mr-1" />
              {isAuthor ? 'Izbriši' : 'Izbriši (moderator)'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
