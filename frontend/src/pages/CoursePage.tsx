import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Calendar, MessageSquare, Plus, FileText } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useMaterialStore } from '../stores/materialStore'
import { MaterialCard } from '../components/materials/MaterialCard'
import { MaterialUploadModal } from '../components/materials/MaterialUploadModal'
import { Button } from '../components/ui/Button'
import logoUrl from '../assets/Logo.png'

type TabType = 'materials' | 'calendar' | 'qa'

export const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const id = parseInt(courseId || '0', 10)
  
  const user = useAuthStore(state => state.user)
  const navigate = useNavigate()
  
  const { materials, fetchMaterials, isLoading } = useMaterialStore()
  const [activeTab, setActiveTab] = useState<TabType>('materials')
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // TODO: Kasneje bomo tukaj fetchali tudi podatke o samem predmetu (naslov, opis)
  // Za zdaj uporabljamo fiksno ime v kodi.

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    
    if (id > 0) {
      fetchMaterials(id)
    }
  }, [id, user, navigate, fetchMaterials])

  if (!user) return null

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Navbar */}
      <header className="bg-primary border-b-4 border-secondary">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-medium text-white/70 tracking-tight leading-tight">Predmet</h1>
              <h2 className="text-lg font-bold text-white tracking-tight leading-tight">Pregled predmeta</h2>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border mb-8 overflow-x-auto pb-[-1px]">
          <button 
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'materials' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-text-main hover:border-border'
            }`}
          >
            <BookOpen size={18} />
            Gradiva
          </button>
          
          <button 
            disabled
            className="flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 border-transparent text-gray-300 cursor-not-allowed whitespace-nowrap"
            title="Kmalu na voljo"
          >
            <Calendar size={18} />
            Rokovnik (Kmalu)
          </button>

          <button 
            disabled
            className="flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 border-transparent text-gray-300 cursor-not-allowed whitespace-nowrap"
            title="Kmalu na voljo"
          >
            <MessageSquare size={18} />
            Q&A (Kmalu)
          </button>
        </div>

        {/* Tab Content: Materials */}
        {activeTab === 'materials' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-main">Študijska gradiva</h3>
                <p className="text-sm text-text-muted mt-1">Skripte, zapiski in ostala literatura za ta predmet.</p>
              </div>
              
              <Button onClick={() => setIsUploadOpen(true)} className="flex items-center shrink-0">
                <Plus size={18} className="mr-2" />
                Naloži gradivo
              </Button>
            </div>

            {isLoading && materials.length === 0 ? (
              <div className="py-12 text-center text-text-muted">Nalaganje gradiv...</div>
            ) : materials.length === 0 ? (
              <div className="bg-surface border border-dashed border-border py-12 px-4 text-center rounded-sm">
                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                <h4 className="text-lg font-semibold text-text-main mb-1">Ni še gradiv</h4>
                <p className="text-text-muted mb-6 max-w-md mx-auto">Za ta predmet še ni objavljenih nobenih gradiv. Bodi prvi in deli svoje zapiske s sošolci!</p>
                <Button onClick={() => setIsUploadOpen(true)} variant="outline">
                  Naloži prvo gradivo
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {materials.map(material => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <MaterialUploadModal 
        courseId={id} 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
    </div>
  )
}
