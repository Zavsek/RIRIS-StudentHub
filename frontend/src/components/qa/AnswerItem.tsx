import { useState } from 'react'
import { Clock, CornerDownRight, Trash2, Send } from 'lucide-react'
import type { Answer } from '../../models/qa'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'

interface AnswerItemProps {
  answer: Answer
  replies: Answer[]
  isModerator: boolean
  onReply: (content: string, parentAnswerId: number) => Promise<void>
  onDeleteAnswer: (answerId: number) => void
}

export const AnswerItem = ({
  answer,
  replies,
  isModerator,
  onReply,
  onDeleteAnswer
}: AnswerItemProps) => {
  const currentUserId = useAuthStore(state => state.user?.id)
  const isAuthor = currentUserId === answer.authorId
  const canDelete = isAuthor || isModerator

  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSendReply = async () => {
    if (!replyText.trim()) return
    setIsSubmitting(true)
    try {
      await onReply(replyText.trim(), answer.id)
      setReplyText('')
      setIsReplying(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const date = new Date(answer.createdAt).toLocaleString('sl-SI', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 mb-1 text-xs">
          <span className="font-bold text-text-main">{answer.authorName}</span>
          <span className="text-text-muted flex items-center gap-1">
            <Clock size={11} className="opacity-70" />
            {date}
          </span>
        </div>

        {canDelete && (
          <button
            onClick={() => onDeleteAnswer(answer.id)}
            className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center"
            title={isAuthor ? 'Izbriši odgovor' : 'Izbriši odgovor kot moderator'}
          >
            <Trash2 size={12} className="mr-1" />
            {isAuthor ? 'Izbriši' : 'Izbriši (moderator)'}
          </button>
        )}
      </div>

      <p className="text-sm text-text-main whitespace-pre-line my-1.5">{answer.content}</p>

      <button
        onClick={() => setIsReplying(!isReplying)}
        className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 mt-1"
      >
        <CornerDownRight size={12} />
        {isReplying ? 'Prekliči odgovor' : 'Odgovori na ta komentar'}
      </button>

      {isReplying && (
        <div className="mt-3 pl-4 border-l-2 border-primary/30 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Odgovori uporabniku ${answer.authorName}...`}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            disabled={isSubmitting}
            onKeyDown={e => { if (e.key === 'Enter') handleSendReply() }}
            className="flex-1 bg-surface border border-border text-xs px-3 py-1.5 rounded-sm focus:outline-none focus:border-primary"
          />
          <Button
            onClick={handleSendReply}
            disabled={isSubmitting || !replyText.trim()}
            variant="primary"
            className="text-xs px-2.5 py-1.5 h-auto flex items-center gap-1"
          >
            <Send size={12} />
            Pošlji
          </Button>
        </div>
      )}

      {/* Render threaded replies */}
      {replies.length > 0 && (
        <div className="mt-3 pl-4 border-l-2 border-border space-y-3">
          {replies.map(reply => {
            const replyDate = new Date(reply.createdAt).toLocaleString('sl-SI', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            })
            const canDeleteReply = currentUserId === reply.authorId || isModerator

            return (
              <div key={reply.id} className="text-xs bg-gray-50/70 p-2.5 rounded-sm">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-main">{reply.authorName}</span>
                    <span className="text-text-muted">{replyDate}</span>
                  </div>
                  {canDeleteReply && (
                    <button
                      onClick={() => onDeleteAnswer(reply.id)}
                      className="text-red-500 hover:text-red-700 hover:underline flex items-center"
                    >
                      <Trash2 size={11} className="mr-0.5" />
                      Izbriši
                    </button>
                  )}
                </div>
                <p className="text-text-main whitespace-pre-line">{reply.content}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
