import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Settings } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { AcademicTree } from '../components/academic/AcademicTree'
import logoUrl from '../assets/Logo.png'

export const CatalogPage = () => {
  const user = useAuthStore(state => state.user)
  const hasHydrated = useAuthStore(state => state.hasHydrated)
  const logout = useAuthStore(state => state.logout)
  const navigate = useNavigate()

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) {
      navigate('/')
    }
  }, [hasHydrated, user, navigate])

  if (!hasHydrated || !user) return null

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Navbar (BrandBar) */}
      <header className="bg-primary border-b-4 border-secondary">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-xl font-bold text-white tracking-tight">Student <span className="text-secondary">Hub</span></h1>
          </Link>
          
          <div className="flex items-center gap-4 text-white">
            <Link to="/dashboard" className="hidden md:block font-medium text-white/80 hover:text-white transition-colors mr-2">
              Domača stran
            </Link>
            <div className="hidden md:block w-px h-6 bg-white/30 mr-2"></div>
            
            <Link to="/profile">
              <button className="flex items-center text-sm font-semibold border-2 border-white/30 text-white px-4 py-1.5 rounded-sm hover:bg-white/10 transition-colors uppercase tracking-wide">
                <Settings size={18} className="mr-2" />
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
          <h2 className="text-2xl font-bold text-text-main">Katalog predmetov</h2>
        </div>
        
        <p className="text-text-muted mb-8 max-w-3xl">
          Brskajte po strukturi fakultet, smeri in letnikov ali uporabite iskalnik za hiter dostop do iskanega predmeta.
        </p>

        <AcademicTree mode="browse" />
      </main>
    </div>
  )
}
