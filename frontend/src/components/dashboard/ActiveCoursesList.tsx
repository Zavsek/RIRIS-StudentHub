import { X } from 'lucide-react'
import type { Course } from '../../models/academic'
import { useUserProfileStore } from '../../stores/userProfileStore'
import { useState } from 'react'

interface ActiveCoursesListProps {
  courses: Course[]
}

export const ActiveCoursesList = ({ courses }: ActiveCoursesListProps) => {
  const removeActiveCourse = useUserProfileStore(state => state.removeActiveCourse)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const handleRemove = async (e: React.MouseEvent, courseId: number) => {
    e.stopPropagation()
    e.preventDefault()
    if (confirm('Ali res želite odstraniti ta predmet z vašega seznama?')) {
      setRemovingId(courseId)
      try {
        await removeActiveCourse(courseId)
      } finally {
        setRemovingId(null)
      }
    }
  }

  // Grupiraj predmete po semestrih
  const groupedCourses = courses.reduce((acc, course) => {
    const sem = course.semester || 'Neznan semester'
    if (!acc[sem]) acc[sem] = []
    acc[sem].push(course)
    return acc
  }, {} as Record<string, Course[]>)

  return (
    <div className="space-y-8">
      {Object.entries(groupedCourses).sort().map(([semester, semsCourses]) => (
        <div key={semester}>
          <h3 className="text-lg font-bold text-text-main mb-4 border-b border-border pb-2">
            {semester === 'Zimski' ? '' : semester === 'Poletni' ?'' : ''}
            {semester} semester
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semsCourses.map(course => (
              <div 
                key={course.id} 
                className={`bg-surface border border-border p-5 hover:border-primary/50 transition-colors cursor-pointer group relative ${removingId === course.id ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <button 
                  onClick={(e) => handleRemove(e, course.id)}
                  className="absolute top-3 right-3 text-text-muted hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Odstrani predmet"
                >
                  <X size={18} />
                </button>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-soft text-primary flex items-center justify-center shrink-0 rounded-sm">
                    <span className="font-bold text-lg">{course.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="pr-6">
                    <h4 className="font-semibold text-text-main group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {course.name}
                    </h4>
                    
                    {course.programName && (
                      <div className="text-xs font-medium text-secondary mt-1.5 mb-1 line-clamp-1">
                        {course.programName}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-text-muted flex-wrap">
                      {course.year && <span className="bg-gray-100 px-1.5 py-0.5 rounded-sm">{course.year}. letnik</span>}
                      {course.ects && <span className="bg-gray-100 px-1.5 py-0.5 rounded-sm">{course.ects} ECTS</span>}
                    </div>
                    
                    {course.professor && (
                      <div className="mt-2 text-xs text-text-muted">
                        Nosilec: <span className="font-medium text-text-main">{course.professor}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
