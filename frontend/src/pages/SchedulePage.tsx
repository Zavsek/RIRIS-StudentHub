import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, Plus, Users, ArrowLeft, Settings, Calendar } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useScheduleStore } from '../stores/scheduleStore'
import { useUserProfileStore } from '../stores/userProfileStore'
import { WeeklyScheduleGrid } from '../components/schedule/WeeklyScheduleGrid'
import { ScheduleEntryModal } from '../components/schedule/ScheduleEntryModal'
import { FreeTimeCompareModal } from '../components/schedule/FreeTimeCompareModal'
import { Button } from '../components/ui/Button'
import logoUrl from '../assets/Logo.png'

export const SchedulePage = () => {
  const user = useAuthStore(state => state.user)
  const hasHydrated = useAuthStore(state => state.hasHydrated)
  const logout = useAuthStore(state => state.logout)
  const navigate = useNavigate()

  const { mySchedule, fetchMySchedule, addScheduleEntry, deleteScheduleEntry, isLoading } = useScheduleStore()
  const { profile, fetchProfile } = useUserProfileStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) {
      navigate('/')
    } else {
      fetchMySchedule()
      if (!profile) fetchProfile()
    }
  }, [hasHydrated, user, navigate, fetchMySchedule, profile, fetchProfile])

  if (!user) return null

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* BrandBar Modri pas, logotip, oranžna črta */}
      <header className="bg-primary text-white shadow-md border-b-4 border-secondary sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <img src={logoUrl} alt="StudentHub" className="h-8 w-auto brightness-0 invert" />
              <span className="font-bold text-xl tracking-tight uppercase">StudentHub</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 text-white">
            <Link to="/dashboard" className="hidden md:block font-medium text-white/80 hover:text-white transition-colors mr-2">
              Moji predmeti
            </Link>
            <Link to="/calendar" className="hidden md:block font-medium text-white/80 hover:text-white transition-colors mr-2">
              Rokovnik
            </Link>
            <Link to="/schedule" className="hidden md:block font-medium text-white underline underline-offset-4 decoration-secondary mr-2">
              Urnik
            </Link>
            <Link to="/catalog" className="hidden md:block font-medium text-white/80 hover:text-white transition-colors mr-2">
              Katalog
            </Link>
            <div className="hidden md:block w-px h-6 bg-white/30 mr-2"></div>
            <div className="hidden lg:block font-medium mr-4">{user.name}</div>
            <Link to="/profile">
              <button className="flex items-center text-sm font-semibold border-2 border-white/30 text-white px-4 py-1.5 rounded-sm hover:bg-white/10 transition-colors uppercase tracking-wide">
                <Settings size={18} className="mr-2 hidden sm:block" />
                Profil
              </button>
            </Link>
            <button
              className="flex items-center text-sm font-semibold text-white px-4 py-1.5 rounded-sm hover:bg-white/10 transition-colors uppercase tracking-wide cursor-pointer"
              onClick={() => logout()}
            >
              Odjava
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link to="/dashboard" className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-primary transition-colors mb-2">
              <ArrowLeft size={14} className="mr-1" />
              Nazaj na nadzorno ploščo
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="text-primary" size={26} />
              <h2 className="text-2xl font-bold text-text-main">Moj tedenski urnik</h2>
            </div>
            <p className="text-sm text-text-muted">
              Tedenski pregled vaših zasedenih terminov in primerjava prostega časa s sošolci.
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

            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Dodaj termin</span>
            </Button>
          </div>
        </div>

        {/* Schedule Grid Area */}
        {isLoading && mySchedule.length === 0 ? (
          <div className="bg-surface border border-border p-12 text-center text-text-muted text-sm shadow-xs">
            Nalaganje vašega tedenskega urnika...
          </div>
        ) : (
          <div className="space-y-4">
            <WeeklyScheduleGrid
              entries={mySchedule}
              onDelete={deleteScheduleEntry}
            />

            {mySchedule.length === 0 && (
              <div className="p-6 bg-slate-50 border border-dashed border-border text-center">
                <p className="text-sm text-text-muted">
                  Vaš osebni urnik je trenutno prazen. Dodajte nov termin ročno ali obiščite stran posameznega predmeta in uvozite privzete termine z enim klikom!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <ScheduleEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addScheduleEntry}
      />

      <FreeTimeCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />
    </div>
  )
}
