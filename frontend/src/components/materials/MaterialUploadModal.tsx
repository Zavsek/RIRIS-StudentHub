import { useState, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useMaterialStore } from '../../stores/materialStore'

interface MaterialUploadModalProps {
  courseId: number
  isOpen: boolean
  onClose: () => void
}

export const MaterialUploadModal = ({ courseId, isOpen, onClose }: MaterialUploadModalProps) => {
  const { uploadMaterial, isLoading } = useMaterialStore()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError('')
    
    if (!selectedFile) return
    
    if (selectedFile.type !== 'application/pdf') {
      setError('Dovoljene so samo PDF datoteke.')
      setFile(null)
      return
    }
    
    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('Datoteka je prevelika (največ 15MB).')
      setFile(null)
      return
    }
    
    setFile(selectedFile)
    if (!title) {
      // Predlagaj naslov iz imena datoteke (brez .pdf)
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Prosim izberite datoteko.')
      return
    }
    if (!title.trim()) {
      setError('Prosim vnesite naslov gradiva.')
      return
    }

    try {
      await uploadMaterial(courseId, title, description, file)
      // Reset & close
      setTitle('')
      setDescription('')
      setFile(null)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Napaka pri nalaganju.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface w-full max-w-lg rounded-sm shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-bold text-text-main">Naloži novo gradivo</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-sm text-sm font-medium">{error}</div>}

          <div>
            <Input 
              label="Naslov gradiva *"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Npr. Skripta za 1. kolokvij"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Kratek opis (neobvezno)</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Opis vsebine..."
              className="w-full min-h-24 p-3 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow text-text-main text-sm rounded-sm resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1.5">Datoteka (PDF) *</label>
            
            <input 
              type="file" 
              accept=".pdf" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            
            {file ? (
              <div className="flex items-center justify-between border border-primary/30 bg-primary-soft p-3 rounded-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="text-primary shrink-0" size={20} />
                  <span className="text-sm font-medium text-text-main truncate">{file.name}</span>
                  <span className="text-xs text-text-muted shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFile(null)} 
                  className="text-text-muted hover:text-red-500 p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary hover:bg-primary-soft/30 p-8 transition-colors rounded-sm text-text-muted"
              >
                <Upload size={28} className="opacity-50" />
                <span className="text-sm font-medium">Kliknite za izbiro PDF datoteke</span>
                <span className="text-xs opacity-70">Največ 15 MB</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Prekliči
            </Button>
            <Button type="submit" disabled={isLoading || !file || !title.trim()}>
              {isLoading ? 'Nalaganje...' : 'Naloži gradivo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
