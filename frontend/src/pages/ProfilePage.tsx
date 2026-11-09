import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useUserProfileStore } from '../stores/userProfileStore'
import logoUrl from '../assets/Logo.png'
import { AcademicSelector } from '../components/profile/AcademicSelector'

export const ProfilePage = () => {
  const user = useAuthStore(state => state.user)
  const { fetchProfile } = useUserProfileStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/')
    } else {
      fetchProfile()
    }
  }, [user, navigate, fetchProfile])

  if (!user) return null

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Navbar (BrandBar) */}
      <header className="bg-primary border-b-4 border-secondary">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
          <h1 className="text-xl font-bold text-white tracking-tight">Nastavitve profila</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="bg-surface border border-border p-6 mb-8">
          <h2 className="text-xl font-bold text-text-main mb-2">Uredi aktivne predmete</h2>
          <p className="text-text-muted mb-6">
            S pomočjo spodnjega iskalnika filtrirajte po fakulteti in smeri ter izberite predmete, ki jih trenutno poslušate. 
            Izbrani predmeti se bodo prikazali na vašem domačem zaslonu.
          </p>
          
          <AcademicSelector />
        </div>
      </main>
    </div>
  )
}
