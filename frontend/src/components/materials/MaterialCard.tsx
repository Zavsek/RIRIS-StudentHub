import { useState } from 'react'
import { FileDown, Trash2, FileText, Clock } from 'lucide-react'
import { Button } from '../ui/Button'
import type { Material } from '../../models/material'
import { useAuthStore } from '../../stores/authStore'
import { useMaterialStore } from '../../stores/materialStore'

interface MaterialCardProps {
  material: Material
}

export const MaterialCard = ({ material }: MaterialCardProps) => {
  const user = useAuthStore(state => state.user)
  const token = useAuthStore(state => state.tokens?.accessToken)
  const deleteMaterial = useMaterialStore(state => state.deleteMaterial)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = user?.id === material.authorId

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/courses/${material.courseId}/materials/${material.id}/download`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      if (!res.ok) {
        alert('Napaka pri prenosu datoteke. Morda ne obstaja več na strežniku.')
        return
      }

      // Ustvari Blob in navidezni gumb za prenos
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = material.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (e) {
      alert('Napaka pri prenosu datoteke.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Ali res želite izbrisati to gradivo? Dejanja ni mogoče razveljaviti.')) return
    
    setIsDeleting(true)
    try {
      await deleteMaterial(material.courseId, material.id)
    } catch (e) {
      alert('Napaka pri brisanju.')
      setIsDeleting(false)
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

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-2">
              <span className="font-medium text-text-main">
                {material.authorName}
              </span>
              <span className="flex items-center">
                <Clock size={12} className="mr-1 opacity-70" />
                {date}
              </span>
              {material.status === 'Cakanje' && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-sm font-medium">
                  Čakanje na pregled
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
          
          {isAuthor && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center mt-1"
            >
              <Trash2 size={12} className="mr-1" />
              Izbriši
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
