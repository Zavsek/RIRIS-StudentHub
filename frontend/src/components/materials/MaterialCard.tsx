import { useState } from 'react'
import { FileDown, Trash2, FileText, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { Button } from '../ui/Button'
import { StarRating } from './StarRating'
import type { Material } from '../../models/material'
import type { MaterialStatus } from '../../models/moderation'
import { useAuthStore } from '../../stores/authStore'
import { useMaterialStore } from '../../stores/materialStore'
import { useModerationStore } from '../../stores/moderationStore'

interface MaterialCardProps {
  material: Material
  isModerator?: boolean
}

export const MaterialCard = ({ material, isModerator = false }: MaterialCardProps) => {
  const user = useAuthStore(state => state.user)
  const token = useAuthStore(state => state.tokens?.accessToken)
  const deleteMaterial = useMaterialStore(state => state.deleteMaterial)
  const rateMaterial = useMaterialStore(state => state.rateMaterial)
  const setMaterialStatus = useModerationStore(state => state.setMaterialStatus)
  
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const isAuthor = user?.id === material.authorId
  const canDelete = isAuthor || isModerator

  const handleRate = async (rating: number) => {
    try {
      await rateMaterial(material.courseId, material.id, rating)
    } catch (e: any) {
      alert(e.message || 'Napaka pri ocenjevanju.')
    }
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/courses/${material.courseId}/materials/${material.id}/download`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      if (!res.ok) {
        alert('Napaka pri prenosu datoteke. Morda ne obstaja več na strežniku.')
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = material.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      alert('Napaka pri prenosu datoteke.')
    }
  }

  const handleDelete = async () => {
    const confirmMsg = isAuthor
      ? 'Ali res želite izbrisati to gradivo? Dejanja ni mogoče razveljaviti.'
      : `Ali kot moderator želite izbrisati gradivo "${material.title}" avtorja ${material.authorName}?`
    
    if (!confirm(confirmMsg)) return
    
    setIsDeleting(true)
    try {
      await deleteMaterial(material.courseId, material.id)
    } catch {
      alert('Napaka pri brisanju.')
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: MaterialStatus) => {
    setIsUpdatingStatus(true)
    try {
      await setMaterialStatus(material.courseId, material.id, newStatus)
    } catch (e: any) {
      alert(e.message || 'Napaka pri posodobitvi statusa.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const date = new Date(material.createdAt).toLocaleDateString('sl-SI', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className={`bg-surface border border-border p-5 transition-colors ${isDeleting ? 'opacity-50' : 'hover:border-primary/50'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center shrink-0 rounded-sm">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-text-main text-lg leading-tight mb-1">
              {material.title}
            </h3>
            
            {material.description && (
              <p className="text-sm text-text-muted line-clamp-2 mb-3">
                {material.description}
              </p>
            )}

            {/* Ocenjevanje z zvezdicami (US-12) */}
            <div className="mt-2 mb-2">
              <StarRating
                averageRating={material.averageRating}
                ratingCount={material.ratingCount ?? 0}
                userRating={material.userRating}
                onRate={handleRate}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-2">
              <span className="font-medium text-text-main">
                {material.authorName}
              </span>
              <span className="flex items-center">
                <Clock size={12} className="mr-1 opacity-70" />
                {date}
              </span>

              {/* Status značke */}
              {material.status === 'Priporoceno' && (
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1 border border-green-200">
                  <CheckCircle2 size={13} className="text-green-600" />
                  Priporočeno
                </span>
              )}
              {material.status === 'Nepriporoceno' && (
                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1 border border-red-200">
                  <XCircle size={13} className="text-red-600" />
                  Nepriporočeno
                </span>
              )}
              {material.status === 'Cakanje' && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-sm font-medium border border-yellow-200">
                  Čakanje na pregled
                </span>
              )}

              {material.reviewedByName && material.status !== 'Cakanje' && (
                <span className="text-xs text-text-muted italic">
                  (Pregledal: {material.reviewedByName})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Button onClick={handleDownload} variant="primary" className="flex items-center px-3 py-1.5 h-auto text-sm">
            <FileDown size={16} className="mr-1.5" />
            Prenesi
          </Button>
          
          {canDelete && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center mt-1"
              title={isAuthor ? 'Izbriši lastno gradivo' : 'Izbriši gradivo kot moderator'}
            >
              <Trash2 size={12} className="mr-1" />
              {isAuthor ? 'Izbriši' : 'Izbriši (moderator)'}
            </button>
          )}
        </div>
      </div>

      {/* Moderacijska orodna vrstica - vsem moderatorjem dodeljenega predmeta */}
      {isModerator && (
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 bg-gray-50/70 p-2.5">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Moderacija gradiva:
          </div>
          
          <div className="flex items-center gap-2">
            {material.status !== 'Priporoceno' && (
              <button
                onClick={() => handleStatusChange('Priporoceno')}
                disabled={isUpdatingStatus}
                className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded-sm font-medium transition-colors"
                title="Označi kot priporočeno za študij"
              >
                <CheckCircle2 size={13} />
                Priporočeno
              </button>
            )}

            {material.status !== 'Nepriporoceno' && (
              <button
                onClick={() => handleStatusChange('Nepriporoceno')}
                disabled={isUpdatingStatus}
                className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-sm font-medium transition-colors"
                title="Označi kot nepriporočeno gradivo"
              >
                <XCircle size={13} />
                Nepriporočeno
              </button>
            )}

            {material.status !== 'Cakanje' && (
              <button
                onClick={() => handleStatusChange('Cakanje')}
                disabled={isUpdatingStatus}
                className="flex items-center gap-1 text-xs bg-white border border-border hover:bg-gray-100 text-text-muted px-2 py-1 rounded-sm transition-colors"
                title="Ponastavi status nazaj v čakanje"
              >
                <RotateCcw size={12} />
                Ponastavi
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
