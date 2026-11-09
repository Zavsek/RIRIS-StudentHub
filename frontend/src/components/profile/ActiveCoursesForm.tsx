import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { useUserProfileStore } from '../../stores/userProfileStore'
import type { Course } from '../../models/academic'

interface ActiveCoursesFormProps {
  availableCourses: Course[]
}

export const ActiveCoursesForm = ({ availableCourses }: ActiveCoursesFormProps) => {
  const { profile, updateActiveCourses, fetchProfile, isLoading } = useUserProfileStore()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (profile) {
      setSelectedIds(new Set(profile.activeCourses.map(c => c.id)))
    }
  }, [profile])

  const toggleCourse = (id: number) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSuccessMsg('')
    try {
      await updateActiveCourses(Array.from(selectedIds))
      await fetchProfile() // Refresh to get updated course details
      setSuccessMsg('Spremembe so bile uspešno shranjene.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e) {
      // Error is handled in store
    } finally {
      setIsSaving(false)
    }
  }

  // Grupiraj predmete po letniku in semestru
  const groupedCourses = availableCourses.reduce((acc, course) => {
    const key = `${course.year || '?'}. letnik - ${course.semester || '?'} semester`
    if (!acc[key]) acc[key] = []
    acc[key].push(course)
    return acc
  }, {} as Record<string, Course[]>)

  if (availableCourses.length === 0) {
    return <div className="text-text-muted text-sm py-4">Za to smer ni najdenih predmetov.</div>
  }

  return (
    <div>
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-6">
        {Object.entries(groupedCourses).sort().map(([group, courses]) => (
          <div key={group}>
            <h4 className="text-sm font-semibold text-primary mb-3 pb-1 border-b border-border">{group}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {courses.map(course => (
                <label 
                  key={course.id}
                  className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                    selectedIds.has(course.id) ? 'bg-primary-soft border-primary' : 'bg-surface border-border hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-primary rounded-sm border-gray-300 focus:ring-primary mt-0.5"
                    checked={selectedIds.has(course.id)}
                    onChange={() => toggleCourse(course.id)}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-text-main line-clamp-1 block">
                      {course.name}
                    </span>
                    {(course.ects || course.professor) && (
                      <span className="text-xs text-text-muted mt-0.5 block">
                        {course.ects ? `${course.ects} ECTS` : ''} 
                        {course.ects && course.professor ? ' • ' : ''}
                        {course.professor ? course.professor : ''}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? 'Shranjevanje...' : 'Shrani izbrane predmete'}
        </Button>
        {successMsg && (
          <span className="text-sm text-green-600 font-medium">{successMsg}</span>
        )}
      </div>
    </div>
  )
}
