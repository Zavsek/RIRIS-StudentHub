import { Calendar as CalendarIcon, Clock, Edit2, Trash2, BookOpen } from 'lucide-react'
import type { Obligation } from '../../models/calendar'

interface ObligationCardProps {
  obligation: Obligation
  isModerator?: boolean
  showCourseName?: boolean
  onEdit?: (obligation: Obligation) => void
  onDelete?: (obligationId: number) => void
}

export const ObligationCard = ({
  obligation,
  isModerator = false,
  showCourseName = false,
  onEdit,
  onDelete
}: ObligationCardProps) => {
  const d = new Date(obligation.date)
  const isPast = d.getTime() < Date.now()

  const formattedDate = d.toLocaleDateString('sl-SI', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
  const formattedTime = d.toLocaleTimeString('sl-SI', {
    hour: '2-digit', minute: '2-digit'
  })

  // Izračun dni do roka
  const diffDays = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  let countdownText = ''
  let countdownClass = ''

  if (isPast) {
    countdownText = 'Poteklo'
    countdownClass = 'bg-gray-100 text-gray-600 border-gray-300'
  } else if (diffDays === 0) {
    countdownText = 'Danes'
    countdownClass = 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse'
  } else if (diffDays === 1) {
    countdownText = 'Jutri'
    countdownClass = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold'
  } else {
    countdownText = `Čez ${diffDays} dni`
    countdownClass = 'bg-blue-50 text-blue-800 border-blue-200'
  }

  const typeColor = 
    obligation.type === 'Izpit' ? 'bg-red-600 text-white' :
    obligation.type === 'Kolokvij' ? 'bg-primary text-white' :
    'bg-secondary text-white'

  return (
    <div className={`bg-surface border p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
      isPast ? 'border-border/60 opacity-75' : 'border-border hover:border-primary/50'
    }`}>
      <div className="flex items-start gap-4 flex-1">
        {/* Datumski blok */}
        <div className="w-14 h-14 bg-gray-50 border border-border flex flex-col items-center justify-center shrink-0 rounded-sm text-center">
          <span className="text-xs text-text-muted font-bold uppercase leading-tight">
            {d.toLocaleDateString('sl-SI', { month: 'short' })}
          </span>
          <span className="text-xl font-black text-text-main leading-tight">
            {d.getDate()}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${typeColor}`}>
              {obligation.type}
            </span>

            <span className={`text-xs px-2 py-0.5 rounded-sm border ${countdownClass}`}>
              {countdownText}
            </span>

            {showCourseName && obligation.courseName && (
              <span className="bg-gray-100 text-text-main text-xs px-2 py-0.5 rounded-sm font-medium flex items-center gap-1 border border-border">
                <BookOpen size={11} className="text-primary" />
                {obligation.courseName}
              </span>
            )}
          </div>

          <h4 className="text-lg font-bold text-text-main mb-1">{obligation.title}</h4>

          {obligation.description && (
            <p className="text-sm text-text-muted mb-2 whitespace-pre-line">
              {obligation.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1 font-medium text-text-main">
              <CalendarIcon size={12} className="opacity-70" />
              {formattedDate} ob {formattedTime}
            </span>
            <span>•</span>
            <span>Vpisal: {obligation.authorName}</span>
          </div>
        </div>
      </div>

      {isModerator && (
        <div className="flex items-center gap-2 shrink-0 md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-border">
          {onEdit && (
            <button
              onClick={() => onEdit(obligation)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-text-main px-3 py-1.5 rounded-sm font-medium flex items-center gap-1 transition-colors"
            >
              <Edit2 size={12} />
              Uredi
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(obligation.id)}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-sm font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} />
              Izbriši
            </button>
          )}
        </div>
      )}
    </div>
  )
}
