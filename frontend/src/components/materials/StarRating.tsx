import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  averageRating?: number | null
  ratingCount?: number
  userRating?: number | null
  onRate?: (rating: number) => Promise<void> | void
  readOnly?: boolean
}

export const StarRating = ({
  averageRating,
  ratingCount = 0,
  userRating,
  onRate,
  readOnly = false
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeRating = hoverRating !== null ? hoverRating : (userRating ?? averageRating ?? 0)

  const handleStarClick = async (star: number) => {
    if (readOnly || !onRate || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onRate(star)
    } finally {
      setIsSubmitting(false)
      setHoverRating(null)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs select-none">
      {/* 5-star interactive bar */}
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => !readOnly && setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map(star => {
          const isFilled = star <= Math.round(activeRating)
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly || isSubmitting}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onClick={() => handleStarClick(star)}
              className={`p-0.5 transition-transform ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-120'
              }`}
              title={readOnly ? undefined : `Oceni z ${star} zvezdicami`}
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-500'
                    : 'fill-none text-slate-300'
                }`}
              />
            </button>
          )
        })}
      </div>

      {/* Average score & count */}
      <div className="flex items-center gap-1.5 text-text-muted">
        {averageRating && ratingCount > 0 ? (
          <span className="font-bold text-text-main">
            {averageRating.toFixed(1)}
          </span>
        ) : (
          <span className="text-[11px] italic">Brez ocen</span>
        )}
        <span className="text-[11px]">
          ({ratingCount} {ratingCount === 1 ? 'ocena' : ratingCount === 2 ? 'oceni' : ratingCount === 3 || ratingCount === 4 ? 'ocene' : 'ocen'})
        </span>
      </div>

      {/* Current user's own rating badge */}
      {userRating && (
        <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-sm">
          Tvoja ocena: {userRating} ★
        </span>
      )}
    </div>
  )
}
