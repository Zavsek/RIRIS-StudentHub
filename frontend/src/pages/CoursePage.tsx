import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Calendar, MessageSquare, Plus, FileText, ShieldCheck, Filter } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useMaterialStore } from '../stores/materialStore'
import { useModerationStore } from '../stores/moderationStore'
import { MaterialCard } from '../components/materials/MaterialCard'
import { MaterialUploadModal } from '../components/materials/MaterialUploadModal'
import { Button } from '../components/ui/Button'
import logoUrl from '../assets/Logo.png'

type TabType = 'materials' | 'calendar' | 'qa'
type StatusFilter = 'ALL' | 'Cakanje' | 'Priporoceno' | 'Nepriporoceno'

export const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const id = parseInt(courseId || '0', 10)
  
  const user = useAuthStore(state => state.user)
  const hasHydrated = useAuthStore(state => state.hasHydrated)
  const navigate = useNavigate()
  
  const { materials, fetchMaterials, isLoading } = useMaterialStore()
  const { isModerator, checkCourseModeration, assignModerator, removeModerator } = useModerationStore()
  
  const [activeTab, setActiveTab] = useState<TabType>('materials')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) {
      navigate('/')
      return
    }
    
    if (id > 0) {
      fetchMaterials(id)
      checkCourseModeration(id)
    }
  }, [hasHydrated, id, user, navigate, fetchMaterials, checkCourseModeration])

  const handleToggleModerator = async () => {
    if (!user) return
    try {
      if (isModerator) {
        await removeModerator(id, user.id)
      } else {
        await assignModerator(id, user.id)
      }
    } catch (e: any) {
      alert(e.message || 'Napaka pri spreminjanju vloge moderatorja.')
    }
  }

  const filteredMaterials = useMemo(() => {
    if (statusFilter === 'ALL') return materials
    return materials.filter(m => m.status === statusFilter)
  }, [materials, statusFilter])

  const counts = useMemo(() => {
    return {
      all: materials.length,
      pending: materials.filter(m => m.status === 'Cakanje').length,
      recommended: materials.filter(m => m.status === 'Priporoceno').length,
      notRecommended: materials.filter(m => m.status === 'Nepriporoceno').length
    }
  }, [materials])

  if (!hasHydrated || !user) return null

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
            <div>
              <h1 className="text-sm font-medium text-white/70 tracking-tight leading-tight">Predmet #{id}</h1>
              <h2 className="text-lg font-bold text-white tracking-tight leading-tight">Pregled predmeta</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isModerator ? (
              <span className="bg-white/10 border border-white/30 text-white text-xs px-2.5 py-1 rounded-sm flex items-center gap-1.5 font-medium">
                <ShieldCheck size={14} className="text-secondary" />
                Moderator predmeta
              </span>
            ) : null}

            <button
              onClick={handleToggleModerator}
              className="text-xs text-white/80 hover:text-white underline bg-white/5 hover:bg-white/10 px-2 py-1 rounded-sm transition-colors"
              title="Testna funkcija za dodelitev/odvzem moderatorskih pravic za ta predmet"
            >
              {isModerator ? 'Prekliči vlogo moderatorja' : 'Postani moderator (test)'}
            </button>
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

            {/* Filter po statusih */}
            {materials.length > 0 && (
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
                <span className="flex items-center gap-1 text-text-muted font-medium mr-1">
                  <Filter size={13} />
                  Filter:
                </span>
                
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-sm font-medium transition-colors border ${
                    statusFilter === 'ALL'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-text-muted border-border hover:bg-gray-100'
                  }`}
                >
                  Vsa ({counts.all})
                </button>

                <button
                  onClick={() => setStatusFilter('Priporoceno')}
                  className={`px-3 py-1 rounded-sm font-medium transition-colors border ${
                    statusFilter === 'Priporoceno'
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-surface text-green-700 border-border hover:bg-green-50'
                  }`}
                >
                  Priporočeno ({counts.recommended})
                </button>

                <button
                  onClick={() => setStatusFilter('Cakanje')}
                  className={`px-3 py-1 rounded-sm font-medium transition-colors border ${
                    statusFilter === 'Cakanje'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-surface text-amber-700 border-border hover:bg-amber-50'
                  }`}
                >
                  V čakanju ({counts.pending})
                </button>

                <button
                  onClick={() => setStatusFilter('Nepriporoceno')}
                  className={`px-3 py-1 rounded-sm font-medium transition-colors border ${
                    statusFilter === 'Nepriporoceno'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-surface text-red-700 border-border hover:bg-red-50'
                  }`}
                >
                  Nepriporočeno ({counts.notRecommended})
                </button>
              </div>
            )}

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
            ) : filteredMaterials.length === 0 ? (
              <div className="bg-surface border border-border p-8 text-center text-text-muted">
                Nobeno gradivo ne ustreza izbranemu filtru statusa.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredMaterials.map(material => (
                  <MaterialCard key={material.id} material={material} isModerator={isModerator} />
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
