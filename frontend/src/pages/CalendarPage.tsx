import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ArrowLeft, Settings, List } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useCalendarStore } from '../stores/calendarStore'
import { ObligationCard } from '../components/calendar/ObligationCard'
import { CalendarGridView } from '../components/calendar/CalendarGridView'
import type { ObligationType } from '../models/calendar'
import logoUrl from '../assets/Logo.png'

type TimeFilter = 'UPCOMING' | 'ALL' | 'PAST'
type TypeFilter = 'ALL' | ObligationType

export const CalendarPage = () => {
  const user = useAuthStore(state => state.user)
  const hasHydrated = useAuthStore(state => state.hasHydrated)
  const logout = useAuthStore(state => state.logout)
  const navigate = useNavigate()

  const { allObligations, fetchAllObligations, isLoading } = useCalendarStore()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('UPCOMING')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL')

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) {
      navigate('/')
    } else {
      fetchAllObligations()
    }
  }, [hasHydrated, user, navigate, fetchAllObligations])

  const filteredObligations = useMemo(() => {
    const now = Date.now()
    return allObligations.filter(ob => {
      const isPast = new Date(ob.date).getTime() < now
      if (timeFilter === 'UPCOMING' && isPast) return false
      if (timeFilter === 'PAST' && !isPast) return false
      if (typeFilter !== 'ALL' && ob.type !== typeFilter) return false
      return true
    })
  }, [allObligations, timeFilter, typeFilter])

  const counts = useMemo(() => {
    const now = Date.now()
    return {
      all: allObligations.length,
      upcoming: allObligations.filter(o => new Date(o.date).getTime() >= now).length,
      kolokvij: allObligations.filter(o => o.type === 'Kolokvij').length,
      izpit: allObligations.filter(o => o.type === 'Izpit').length,
      oddaja: allObligations.filter(o => o.type === 'Oddaja').length
    }
  }, [allObligations])

  if (!hasHydrated || !user) return null

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* BrandBar */}
      <header className="bg-primary border-b-4 border-secondary">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors mr-1">
              <ArrowLeft size={24} />
            </Link>
            <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-xl font-bold text-white tracking-tight">Student <span className="text-secondary">Hub</span></h1>
          </div>
          
          <div className="flex items-center gap-4 text-white">
            <Link to="/dashboard" className="hidden md:block font-medium text-white/80 hover:text-white transition-colors mr-2">
              Moji predmeti
            </Link>
            <Link to="/calendar" className="hidden md:block font-medium text-white underline underline-offset-4 decoration-secondary mr-2">
              Rokovnik
            </Link>
            <Link to="/schedule" className="hidden md:block font-medium text-white/80 hover:text-white transition-colors mr-2">
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
            <button className="flex items-center text-sm font-semibold text-white px-4 py-1.5 rounded-sm hover:bg-white/10 transition-colors uppercase tracking-wide" onClick={() => logout()}>
              Odjava
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="text-primary" size={26} />
              <h2 className="text-2xl font-bold text-text-main">Skupni rokovnik obveznosti</h2>
            </div>
            <p className="text-sm text-text-muted">
              Pregled vseh kolokvijev, izpitov in oddaj za vse vaše vpisane predmete na enem mestu.
            </p>
          </div>

          {/* Stikalo za preklop med koledarskim in seznamskim pogledom */}
          <div className="flex items-center bg-gray-100 p-1 border border-border rounded-sm shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Calendar size={15} />
              Koledar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <List size={15} />
              Seznam
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <CalendarGridView
            obligations={allObligations}
            showCourseName={true}
          />
        ) : (
          <div>
            {/* Filtri za seznam */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-surface border border-border p-3 rounded-sm">
              <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
                <span className="font-semibold text-text-muted uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter size={12} />
                  Čas:
                </span>
                <button
                  onClick={() => setTimeFilter('UPCOMING')}
                  className={`px-3 py-1 rounded-sm font-medium transition-colors border ${
                    timeFilter === 'UPCOMING'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text-muted border-border hover:bg-gray-50'
                  }`}
                >
                  Prihajajoči ({counts.upcoming})
                </button>
                <button
                  onClick={() => setTimeFilter('ALL')}
                  className={`px-3 py-1 rounded-sm font-medium transition-colors border ${
                    timeFilter === 'ALL'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text-muted border-border hover:bg-gray-50'
                  }`}
                >
                  Vsi ({counts.all})
                </button>
                <button
                  onClick={() => setTimeFilter('PAST')}
                  className={`px-3 py-1 rounded-sm font-medium transition-colors border ${
                    timeFilter === 'PAST'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text-muted border-border hover:bg-gray-50'
                  }`}
                >
                  Pretekli
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-text-muted uppercase tracking-wider mr-1">Tip:</span>
                <button
                  onClick={() => setTypeFilter('ALL')}
                  className={`px-2.5 py-1 rounded-sm font-medium transition-colors border ${
                    typeFilter === 'ALL'
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-text-muted border-border hover:bg-gray-50'
                  }`}
                >
                  Vsi
                </button>
                <button
                  onClick={() => setTypeFilter('Kolokvij')}
                  className={`px-2.5 py-1 rounded-sm font-medium transition-colors border ${
                    typeFilter === 'Kolokvij'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-primary border-border hover:bg-blue-50'
                  }`}
                >
                  Kolokvij ({counts.kolokvij})
                </button>
                <button
                  onClick={() => setTypeFilter('Izpit')}
                  className={`px-2.5 py-1 rounded-sm font-medium transition-colors border ${
                    typeFilter === 'Izpit'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-red-600 border-border hover:bg-red-50'
                  }`}
                >
                  Izpit ({counts.izpit})
                </button>
                <button
                  onClick={() => setTypeFilter('Oddaja')}
                  className={`px-2.5 py-1 rounded-sm font-medium transition-colors border ${
                    typeFilter === 'Oddaja'
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-white text-secondary border-border hover:bg-orange-50'
                  }`}
                >
                  Oddaja ({counts.oddaja})
                </button>
              </div>
            </div>

            {/* Seznam obveznosti */}
            {isLoading && allObligations.length === 0 ? (
              <div className="py-12 text-center text-text-muted">Nalaganje rokovnika...</div>
            ) : filteredObligations.length === 0 ? (
              <div className="bg-surface border border-dashed border-border py-12 px-4 text-center rounded-sm">
                <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                <h4 className="text-lg font-semibold text-text-main mb-1">Ni najdenih obveznosti</h4>
                <p className="text-text-muted max-w-md mx-auto text-sm">
                  Za izbrane filtre trenutno ni vnesenih nobenih obveznosti v vaših aktivnih predmetih.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredObligations.map(ob => (
                  <ObligationCard
                    key={ob.id}
                    obligation={ob}
                    showCourseName={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
