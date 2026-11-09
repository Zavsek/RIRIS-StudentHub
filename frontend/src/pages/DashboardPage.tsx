import { useEffect } from 'react'
import { BookOpen, Search, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useUserProfileStore } from '../stores/userProfileStore'
import { Button } from '../components/ui/Button'
import logoUrl from '../assets/Logo.png'
import { ActiveCoursesList } from '../components/dashboard/ActiveCoursesList'

export const DashboardPage = () => {
  const user = useAuthStore(state => state.user)
  const hasHydrated = useAuthStore(state => state.hasHydrated)
  const logout = useAuthStore(state => state.logout)
  const { profile, fetchProfile, isLoading } = useUserProfileStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) {
      navigate('/')
    } else {
      fetchProfile()
    }
  }, [hasHydrated, user, navigate, fetchProfile])

  if (!hasHydrated || !user) return null

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Navbar (BrandBar) */}
      <header className="bg-primary border-b-4 border-secondary">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-xl font-bold text-white tracking-tight">Student <span className="text-secondary">Hub</span></h1>
          </div>
          
          <div className="flex items-center gap-4 text-white">
            <Link to="/catalog" className="hidden md:block font-medium text-white/80 hover:text-white transition-colors mr-2">
              Katalog predmetov
            </Link>
            <div className="hidden md:block w-px h-6 bg-white/30 mr-2"></div>

            <div className="hidden lg:block font-medium mr-4">{user.name}</div>
            
            <Link to="/profile">
              <button className="flex items-center text-sm font-semibold border-2 border-white/30 text-white px-4 py-1.5 rounded-sm hover:bg-white/10 transition-colors uppercase tracking-wide">
                <Settings size={18} className="mr-2 hidden sm:block" />
                Profil
              </button>
            </Link>
            <button className="flex items-center text-sm font-semibold text-white px-4 py-1.5 rounded-sm hover:bg-white/10 transition-colors uppercase tracking-wide" onClick={() => logout()}>
              Odjava
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-primary" size={28} />
          <h2 className="text-2xl font-bold text-text-main">Moji aktivni predmeti</h2>
        </div>
        
        {isLoading && !profile ? (
          <div className="text-text-muted">Nalaganje predmetov...</div>
        ) : profile?.activeCourses.length === 0 ? (
          <div className="bg-surface border border-border p-8 text-center">
            <p className="text-text-muted mb-4">Trenutno nimate izbranih nobenih aktivnih predmetov.</p>
            <Link to="/profile">
              <Button>
                <Search size={18} className="mr-2" />
                Poišči in dodaj predmete
              </Button>
            </Link>
          </div>
        ) : (
          <ActiveCoursesList courses={profile?.activeCourses || []} />
        )}
      </main>
    </div>
  )
}
