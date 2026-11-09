import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, Folder, Search } from 'lucide-react'
import { useAcademicStore } from '../../stores/academicStore'
import type { Faculty, Program, Course } from '../../models/academic'

interface AcademicTreeProps {
  mode: 'browse' | 'select'
  preselectedCourseIds?: number[]
  onSelectionChange?: (ids: number[]) => void
}

type Step = 'faculty' | 'program' | 'year' | 'semester' | 'course' | 'search'

export const AcademicTree = ({ mode, preselectedCourseIds, onSelectionChange }: AcademicTreeProps) => {
  const { faculties, programs, courses, fetchFaculties, fetchPrograms, fetchCourses, searchCourses, isLoading } = useAcademicStore()

  const [step, setStep] = useState<Step>('faculty')
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Course[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Ohranimo lokalno stanje izbire, da se ne izgubi ob premikanju po drevesu
  const [draftSelection, setDraftSelection] = useState<Set<number>>(new Set(preselectedCourseIds || []))

  // Sinhronizacija zunanjega stanja samo enkrat ob nalaganju ali ob ročni posodobitvi rekvizita (prop)
  useEffect(() => {
    if (preselectedCourseIds) {
      setDraftSelection(new Set(preselectedCourseIds))
    }
  }, [preselectedCourseIds])

  useEffect(() => {
    fetchFaculties()
  }, [fetchFaculties])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 3) {
        setIsSearching(true)
        setStep('search')
        const results = await searchCourses(searchQuery)
        setSearchResults(results)
        setIsSearching(false)
      } else if (searchQuery.trim().length === 0 && step === 'search') {
        setStep('faculty')
        setSelectedFaculty(null)
        setSelectedProgram(null)
        setSelectedYear(null)
        setSelectedSemester(null)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, searchCourses, step])

  const toggleCourse = (id: number) => {
    if (mode !== 'select') return
    const newSet = new Set(draftSelection)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setDraftSelection(newSet)
    onSelectionChange?.(Array.from(newSet))
  }

  const navigateTo = (targetStep: Step) => {
    setSearchQuery('')
    if (targetStep === 'faculty') {
      setSelectedFaculty(null)
      setSelectedProgram(null)
      setSelectedYear(null)
      setSelectedSemester(null)
    } else if (targetStep === 'program') {
      setSelectedProgram(null)
      setSelectedYear(null)
      setSelectedSemester(null)
    } else if (targetStep === 'year') {
      setSelectedYear(null)
      setSelectedSemester(null)
    } else if (targetStep === 'semester') {
      setSelectedSemester(null)
    }
    setStep(targetStep)
  }

  const handleFacultyClick = (faculty: Faculty) => {
    setSelectedFaculty(faculty)
    fetchPrograms(faculty.id)
    setStep('program')
  }

  const handleProgramClick = (program: Program) => {
    setSelectedProgram(program)
    fetchCourses(program.id)
    setStep('year')
  }

  const availablePrograms = selectedFaculty ? programs[selectedFaculty.id] || [] : []
  const availableCourses = selectedProgram ? courses[selectedProgram.id] || [] : []

  // Izračunajmo unikatne letnike iz predmetov za izbrano smer
  const availableYears = useMemo(() => {
    if (!selectedProgram) return []
    const years = availableCourses.map(c => c.year).filter((y): y is number => y != null)
    return Array.from(new Set(years)).sort()
  }, [availableCourses, selectedProgram])

  // Izračunajmo unikatne semestre za izbrani letnik
  const availableSemesters = useMemo(() => {
    if (!selectedProgram || selectedYear == null) return []
    const sem = availableCourses
      .filter(c => c.year === selectedYear)
      .map(c => c.semester)
      .filter((s): s is string => !!s)
    return Array.from(new Set(sem)).sort()
  }, [availableCourses, selectedProgram, selectedYear])

  const finalCourses = availableCourses.filter(c => c.year === selectedYear && c.semester === selectedSemester)

  // Render Pomožne Funkcije
  const renderBreadcrumbs = () => {
    if (step === 'search') {
      return (
        <div className="flex items-center text-sm font-medium text-text-muted mb-6 bg-surface p-3 border border-border">
          <span className="text-primary">Rezultati iskanja: {searchQuery}</span>
        </div>
      )
    }

    return (
      <div className="flex flex-wrap items-center text-sm font-medium text-text-muted mb-6 bg-surface p-3 border border-border gap-y-2">
        <button onClick={() => navigateTo('faculty')} className={`hover:text-primary transition-colors ${step === 'faculty' ? 'text-primary' : ''}`}>
          Fakultete
        </button>
        
        {selectedFaculty && (
          <>
            <ChevronRight size={16} className="mx-2 opacity-50" />
            <button onClick={() => navigateTo('program')} className={`hover:text-primary transition-colors ${step === 'program' ? 'text-primary' : ''} truncate max-w-[200px]`}>
              {selectedFaculty.name}
            </button>
          </>
        )}
        
        {selectedProgram && (
          <>
            <ChevronRight size={16} className="mx-2 opacity-50" />
            <button onClick={() => navigateTo('year')} className={`hover:text-primary transition-colors ${step === 'year' ? 'text-primary' : ''} truncate max-w-[200px]`}>
              {selectedProgram.name}
            </button>
          </>
        )}
        
        {selectedYear && (
          <>
            <ChevronRight size={16} className="mx-2 opacity-50" />
            <button onClick={() => navigateTo('semester')} className={`hover:text-primary transition-colors ${step === 'semester' ? 'text-primary' : ''}`}>
              {selectedYear}. letnik
            </button>
          </>
        )}

        {selectedSemester && (
          <>
            <ChevronRight size={16} className="mx-2 opacity-50" />
            <span className="text-primary">{selectedSemester} semester</span>
          </>
        )}
      </div>
    )
  }

  const renderCard = (title: string, subtitle: string, onClick: () => void, icon: React.ReactNode) => (
    <div 
      onClick={onClick}
      className="bg-surface border border-border p-4 hover:border-primary/50 hover:bg-gray-50 transition-all cursor-pointer flex items-start gap-4 group"
    >
      <div className="w-10 h-10 bg-primary-soft text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-text-main group-hover:text-primary transition-colors line-clamp-2">{title}</h4>
        <span className="text-sm text-text-muted mt-1 block">{subtitle}</span>
      </div>
    </div>
  )

  const renderCourseCard = (course: Course) => (
    <label 
      key={course.id}
      className={`flex items-start gap-4 p-4 border transition-all ${mode === 'select' ? 'cursor-pointer' : ''} ${
        draftSelection.has(course.id) && mode === 'select' ? 'bg-primary-soft border-primary' : 'bg-surface border-border hover:bg-gray-50'
      }`}
    >
      {mode === 'select' && (
        <input 
          type="checkbox" 
          className="w-4 h-4 text-primary rounded-sm border-gray-300 focus:ring-primary mt-1"
          checked={draftSelection.has(course.id)}
          onChange={() => toggleCourse(course.id)}
        />
      )}
      {mode !== 'select' && (
        <div className="w-10 h-10 bg-primary-soft text-primary flex items-center justify-center shrink-0 rounded-sm">
          <span className="font-bold text-lg">{course.name.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div className="flex-1">
        <h4 className={`font-semibold text-text-main ${mode === 'select' && draftSelection.has(course.id) ? 'text-primary' : ''}`}>
          {course.name}
        </h4>
        
        {course.programName && (
          <div className="text-xs font-medium text-secondary mt-1 line-clamp-1">
            {course.programName}
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-text-muted">
          {course.year && <span className="bg-gray-100 px-1.5 py-0.5 rounded-sm">{course.year}. letnik</span>}
          {course.semester && <span className="bg-gray-100 px-1.5 py-0.5 rounded-sm">{course.semester} semester</span>}
          {course.ects && <span className="bg-gray-100 px-1.5 py-0.5 rounded-sm">{course.ects} ECTS</span>}
        </div>
        {course.professor && (
          <div className="mt-2 text-xs text-text-muted">
            Nosilec: <span className="font-medium text-text-main">{course.professor}</span>
          </div>
        )}
      </div>
    </label>
  )

  return (
    <div>
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-text-muted" />
        </div>
        <input
          type="text"
          placeholder="Iskanje predmetov (vsaj 3 znaki)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow text-text-main rounded-sm text-sm"
        />
      </div>

      {renderBreadcrumbs()}

      {isLoading || isSearching ? (
        <div className="py-8 text-center text-text-muted">Nalaganje...</div>
      ) : step === 'search' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.length === 0 ? (
            <div className="col-span-full py-8 text-center text-text-muted">Ni najdenih predmetov.</div>
          ) : (
            searchResults.map(renderCourseCard)
          )}
        </div>
      ) : step === 'faculty' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faculties.map(f => renderCard(
            f.name, 
            f.university || 'Univerza', 
            () => handleFacultyClick(f),
            <Folder size={20} />
          ))}
        </div>
      ) : step === 'program' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePrograms.length === 0 ? (
            <div className="col-span-full py-8 text-center text-text-muted">Ni najdenih smeri.</div>
          ) : (
            availablePrograms.map(p => renderCard(
              p.name,
              `${p.level}. stopnja${p.durationYears ? ` • ${p.durationYears} let` : ''}`,
              () => handleProgramClick(p),
              <Folder size={20} />
            ))
          )}
        </div>
      ) : step === 'year' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availableYears.length === 0 ? (
            <div className="col-span-full py-8 text-center text-text-muted">Ni najdenih letnikov za to smer.</div>
          ) : (
            availableYears.map(y => renderCard(
              `${y}. letnik`,
              selectedProgram?.name || '',
              () => { setSelectedYear(y); setStep('semester') },
              <Folder size={20} />
            ))
          )}
        </div>
      ) : step === 'semester' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availableSemesters.length === 0 ? (
            <div className="col-span-full py-8 text-center text-text-muted">Ni najdenih semestrov.</div>
          ) : (
            availableSemesters.map(s => renderCard(
              `${s} semester`,
              `${selectedYear}. letnik`,
              () => { setSelectedSemester(s); setStep('course') },
              <Folder size={20} />
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {finalCourses.length === 0 ? (
            <div className="col-span-full py-8 text-center text-text-muted">Ni najdenih predmetov.</div>
          ) : (
            finalCourses.map(renderCourseCard)
          )}
        </div>
      )}
    </div>
  )
}
