import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Calendar, MessageSquare, Plus, FileText, ShieldCheck, Filter, HelpCircle, List, Clock, Users } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useMaterialStore } from '../stores/materialStore'
import { useModerationStore } from '../stores/moderationStore'
import { useQaStore } from '../stores/qaStore'
import { useCalendarStore } from '../stores/calendarStore'
import type { Obligation } from '../models/calendar'
import { MaterialCard } from '../components/materials/MaterialCard'
import { MaterialUploadModal } from '../components/materials/MaterialUploadModal'
import { QuestionCard } from '../components/qa/QuestionCard'
import { CreateQuestionModal } from '../components/qa/CreateQuestionModal'
import { QuestionThreadModal } from '../components/qa/QuestionThreadModal'
import { ObligationCard } from '../components/calendar/ObligationCard'
import { ObligationModal } from '../components/calendar/ObligationModal'
import { CalendarGridView } from '../components/calendar/CalendarGridView'
import { CourseTermsPanel } from '../components/schedule/CourseTermsPanel'
import { FreeTimeCompareModal } from '../components/schedule/FreeTimeCompareModal'
import { Button } from '../components/ui/Button'
import logoUrl from '../assets/Logo.png'

type TabType = 'materials' | 'calendar' | 'qa' | 'schedule'
type StatusFilter = 'ALL' | 'Cakanje' | 'Priporoceno' | 'Nepriporoceno'
type MaterialSortOption = 'NEWEST' | 'MOST_RATED' | 'HIGHEST_RATED'

export const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const id = parseInt(courseId || '0', 10)
  
  const user = useAuthStore(state => state.user)
  const hasHydrated = useAuthStore(state => state.hasHydrated)
  const navigate = useNavigate()
  
  const { materials, fetchMaterials, isLoading: isMaterialsLoading } = useMaterialStore()
  const { isModerator, checkCourseModeration, assignModerator, removeModerator } = useModerationStore()
  const { 
    questions, fetchQuestions, isLoading: isQaLoading, 
    openQuestionThread, closeQuestionThread, deleteQuestion 
  } = useQaStore()
  const {
    courseObligations, fetchCourseObligations, isLoading: isCalendarLoading,
    deleteObligation
  } = useCalendarStore()
  
  const [activeTab, setActiveTab] = useState<TabType>('materials')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false)
  const [isObligationModalOpen, setIsObligationModalOpen] = useState(false)
  const [editingObligation, setEditingObligation] = useState<Obligation | null>(null)
  const [initialModalDate, setInitialModalDate] = useState<Date | null>(null)
  const [calendarViewMode, setCalendarViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [materialSort, setMaterialSort] = useState<MaterialSortOption>('NEWEST')
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) {
      navigate('/')
      return
    }
    
    if (id > 0) {
      fetchMaterials(id)
      checkCourseModeration(id)
      fetchQuestions(id)
      fetchCourseObligations(id)
    }
  }, [hasHydrated, id, user, navigate, fetchMaterials, checkCourseModeration, fetchQuestions, fetchCourseObligations])

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

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Ali res želite izbrisati to vprašanje skupaj z vsemi odgovori?')) return
    try {
      await deleteQuestion(id, questionId)
    } catch (e: any) {
      alert(e.message || 'Napaka pri brisanju vprašanja.')
    }
  }

  const handleEditObligation = (ob: Obligation) => {
    setEditingObligation(ob)
    setIsObligationModalOpen(true)
  }

  const handleDeleteObligation = async (obId: number) => {
    if (!confirm('Ali res želite izbrisati to obveznost iz rokovnika?')) return
    try {
      await deleteObligation(id, obId)
    } catch (e: any) {
      alert(e.message || 'Napaka pri brisanju obveznosti.')
    }
  }

  const filteredMaterials = useMemo(() => {
    let result = statusFilter === 'ALL'
      ? [...materials]
      : materials.filter(m => m.status === statusFilter)

    if (materialSort === 'MOST_RATED') {
      result.sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0))
    } else if (materialSort === 'HIGHEST_RATED') {
      result.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return result
  }, [materials, statusFilter, materialSort])

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
            Gradiva ({materials.length})
          </button>

          <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'calendar' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-text-main hover:border-border'
            }`}
          >
            <Calendar size={18} />
            Rokovnik ({courseObligations.length})
          </button>

          <button 
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'qa' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-text-main hover:border-border'
            }`}
          >
            <MessageSquare size={18} />
            Q&A Forum ({questions.length})
          </button>

          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'schedule' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-text-main hover:border-border'
            }`}
          >
            <Clock size={18} />
            Urnik & Predloge
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

                {/* Razvrščanje gradiv (US-12) */}
                <div className="flex items-center gap-1.5 ml-auto pl-2 shrink-0">
                  <span className="text-text-muted font-medium">Razvrsti:</span>
                  <select
                    value={materialSort}
                    onChange={e => setMaterialSort(e.target.value as MaterialSortOption)}
                    className="bg-surface border border-border text-xs px-2.5 py-1 rounded-sm text-text-main focus:outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    <option value="NEWEST">Najnovejše</option>
                    <option value="MOST_RATED">Največkrat ocenjeno</option>
                    <option value="HIGHEST_RATED">Najvišja ocena</option>
                  </select>
                </div>
              </div>
            )}

            {isMaterialsLoading && materials.length === 0 ? (
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

        {/* Tab Content: Calendar (Rokovnik) */}
        {activeTab === 'calendar' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-main">Predmetni rokovnik obveznosti</h3>
                <p className="text-sm text-text-muted mt-1">Pomembni roki za kolokvije, izpite in oddaje pri tem predmetu.</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Preklop med Koledarjem in Seznamom */}
                <div className="flex items-center bg-gray-100 p-1 border border-border rounded-sm">
                  <button
                    onClick={() => setCalendarViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-sm transition-colors ${
                      calendarViewMode === 'grid'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    <Calendar size={14} />
                    Koledar
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-sm transition-colors ${
                      calendarViewMode === 'list'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    <List size={14} />
                    Seznam
                  </button>
                </div>

                {isModerator && (
                  <Button onClick={() => { setInitialModalDate(null); setEditingObligation(null); setIsObligationModalOpen(true); }} className="flex items-center shrink-0">
                    <Plus size={18} className="mr-2" />
                    Dodaj obveznost
                  </Button>
                )}
              </div>
            </div>

            {isCalendarLoading && courseObligations.length === 0 ? (
              <div className="py-12 text-center text-text-muted">Nalaganje obveznosti...</div>
            ) : calendarViewMode === 'grid' ? (
              <CalendarGridView
                obligations={courseObligations}
                isModerator={isModerator}
                onEdit={handleEditObligation}
                onDelete={handleDeleteObligation}
                onAdd={(d) => {
                  setInitialModalDate(d || null);
                  setEditingObligation(null);
                  setIsObligationModalOpen(true);
                }}
              />
            ) : courseObligations.length === 0 ? (
              <div className="bg-surface border border-dashed border-border py-12 px-4 text-center rounded-sm">
                <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                <h4 className="text-lg font-semibold text-text-main mb-1">Ni še vnesenih rokov</h4>
                <p className="text-text-muted mb-6 max-w-md mx-auto">Za ta predmet moderator še ni vnesel nobenih kolokvijev, izpitov ali oddaj.</p>
                {isModerator && (
                  <Button onClick={() => { setInitialModalDate(null); setEditingObligation(null); setIsObligationModalOpen(true); }} variant="outline">
                    Dodaj prvo obveznost
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {courseObligations.map(ob => (
                  <ObligationCard
                    key={ob.id}
                    obligation={ob}
                    isModerator={isModerator}
                    onEdit={handleEditObligation}
                    onDelete={handleDeleteObligation}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Q&A */}
        {activeTab === 'qa' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-main">Predmetni Q&A forum</h3>
                <p className="text-sm text-text-muted mt-1">Zastavi vprašanje glede snovi ali pomagaj sošolcem z odgovori.</p>
              </div>
              
              <Button onClick={() => setIsCreateQuestionOpen(true)} className="flex items-center shrink-0">
                <Plus size={18} className="mr-2" />
                Zastavi vprašanje
              </Button>
            </div>

            {isQaLoading && questions.length === 0 ? (
              <div className="py-12 text-center text-text-muted">Nalaganje vprašanj...</div>
            ) : questions.length === 0 ? (
              <div className="bg-surface border border-dashed border-border py-12 px-4 text-center rounded-sm">
                <HelpCircle size={48} className="mx-auto text-gray-300 mb-3" />
                <h4 className="text-lg font-semibold text-text-main mb-1">Ni še vprašanj</h4>
                <p className="text-text-muted mb-6 max-w-md mx-auto">Imaš vprašanje glede vaj, predavanj ali naloženih zapiskov? Zastavi ga tukaj!</p>
                <Button onClick={() => setIsCreateQuestionOpen(true)} variant="outline">
                  Zastavi prvo vprašanje
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {questions.map(q => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    isModerator={isModerator}
                    onOpenThread={openQuestionThread}
                    onDeleteQuestion={handleDeleteQuestion}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Schedule / Terms */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-text-main">Predmetni urnik in prosti čas</h3>
                <p className="text-sm text-text-muted mt-1">
                  Dodajte privzete termine v svoj osebni urnik ali poiščite skupni prosti čas s sošolci.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCompareModalOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Users size={16} />
                  <span>Primerjaj prosti čas</span>
                </Button>

                <Link to="/schedule">
                  <Button type="button" variant="primary" className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>Moj osebni urnik</span>
                  </Button>
                </Link>
              </div>
            </div>

            <CourseTermsPanel courseId={id} isModerator={isModerator} />
          </div>
        )}
      </main>

      <MaterialUploadModal 
        courseId={id} 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />

      <CreateQuestionModal
        courseId={id}
        isOpen={isCreateQuestionOpen}
        materials={materials}
        onClose={() => setIsCreateQuestionOpen(false)}
      />

      <QuestionThreadModal
        isModerator={isModerator}
        onClose={closeQuestionThread}
      />

      <ObligationModal
        courseId={id}
        isOpen={isObligationModalOpen}
        obligation={editingObligation}
        initialDate={initialModalDate}
        onClose={() => {
          setIsObligationModalOpen(false)
          setEditingObligation(null)
          setInitialModalDate(null)
        }}
      />

      <FreeTimeCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        initialCourseId={id}
      />
    </div>
  )
}
