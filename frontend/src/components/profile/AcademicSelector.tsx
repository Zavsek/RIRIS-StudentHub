import { useState, useEffect } from 'react'
import { useAcademicStore } from '../../stores/academicStore'
import { ActiveCoursesForm } from './ActiveCoursesForm'

export const AcademicSelector = () => {
  const { faculties, programs, courses, fetchFaculties, fetchPrograms, fetchCourses, isLoading } = useAcademicStore()
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | ''>('')
  const [selectedProgramId, setSelectedProgramId] = useState<number | ''>('')

  useEffect(() => {
    fetchFaculties()
  }, [fetchFaculties])

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facId = e.target.value === '' ? '' : Number(e.target.value)
    setSelectedFacultyId(facId)
    setSelectedProgramId('')
    if (facId !== '') {
      fetchPrograms(facId)
    }
  }

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const progId = e.target.value === '' ? '' : Number(e.target.value)
    setSelectedProgramId(progId)
    if (progId !== '') {
      fetchCourses(progId)
    }
  }

  const availablePrograms = selectedFacultyId !== '' ? programs[selectedFacultyId] || [] : []
  const availableCourses = selectedProgramId !== '' ? courses[selectedProgramId] || [] : []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Izbira fakultete */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-main">Fakulteta</label>
          <select 
            value={selectedFacultyId} 
            onChange={handleFacultyChange}
            className="h-10 px-3 bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow text-text-main"
          >
            <option value="">-- Izberi fakulteto --</option>
            {faculties.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* Izbira smeri */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-main">Smer / Program</label>
          <select 
            value={selectedProgramId} 
            onChange={handleProgramChange}
            disabled={selectedFacultyId === '' || isLoading}
            className="h-10 px-3 bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow text-text-main disabled:opacity-50 disabled:bg-gray-50"
          >
            <option value="">-- Izberi smer --</option>
            {availablePrograms.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedProgramId !== '' && (
        <div className="pt-4 border-t border-border">
          <h3 className="font-semibold text-text-main mb-4">Predmeti za izbrano smer</h3>
          <ActiveCoursesForm availableCourses={availableCourses} />
        </div>
      )}
    </div>
  )
}
