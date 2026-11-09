import { useEffect, useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useUserProfileStore } from '../stores/userProfileStore'
import logoUrl from '../assets/Logo.png'
import { AcademicTree } from '../components/academic/AcademicTree'
import { Button } from '../components/ui/Button'

export const ProfilePage = () => {
  const user = useAuthStore(state => state.user)
  const hasHydrated = useAuthStore(state => state.hasHydrated)
  const { profile, fetchProfile, updateActiveCourses, isLoading } = useUserProfileStore()
  const navigate = useNavigate()

  const [draftIds, setDraftIds] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) {
      navigate('/')
    } else {
      fetchProfile()
    }
  }, [hasHydrated, user, navigate, fetchProfile])

  useEffect(() => {
    if (profile) {
      setDraftIds(profile.activeCourses.map(c => c.id))
    }
  }, [profile])

  const handleSave = async () => {
    setIsSaving(true)
    setSuccessMsg('')
    try {
      await updateActiveCourses(draftIds)
      await fetchProfile()
      setSuccessMsg('Spremembe so bile uspešno shranjene.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e) {
      // napake se obravnavajo v store-u
    } finally {
      setIsSaving(false)
    }
  }

  if (!hasHydrated || !user) return null

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Navbar (BrandBar) */}
      <header className="bg-primary border-b-4 border-secondary">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-xl font-bold text-white tracking-tight">Nastavitve profila</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {successMsg && <span className="text-sm text-green-300 font-medium hidden md:block">{successMsg}</span>}
            <Button onClick={handleSave} disabled={isSaving || isLoading} className="hidden md:flex items-center text-sm py-1.5 px-4 shadow-md bg-secondary hover:bg-secondary-hover text-white">
              <Save size={16} className="mr-2" />
              {isSaving ? 'Shranjujem...' : 'Shrani spremembe'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="bg-surface border border-border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-main mb-2">Uredi aktivne predmete</h2>
              <p className="text-text-muted">
                Preklikajte strukturo fakultet ali uporabite iskalnik in obkljukajte predmete, ki jih trenutno poslušate. 
                Vaša izbira se ohrani med brskanjem, na koncu pa kliknite gumb za shranjevanje.
              </p>
            </div>
            <div className="md:hidden flex flex-col gap-2">
              <Button onClick={handleSave} disabled={isSaving || isLoading} variant="secondary" fullWidth>
                <Save size={16} className="mr-2" />
                {isSaving ? 'Shranjujem...' : 'Shrani spremembe'}
              </Button>
              {successMsg && <span className="text-sm text-green-600 font-medium text-center">{successMsg}</span>}
            </div>
          </div>
          
          <div className="border-t border-border pt-6">
            <AcademicTree mode="select" preselectedCourseIds={draftIds} onSelectionChange={setDraftIds} />
          </div>
        </div>
      </main>
    </div>
  )
}
