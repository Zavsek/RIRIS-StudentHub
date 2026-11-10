import { Link } from 'react-router-dom'
import { ShieldCheck, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { ModerationCourse } from '../../models/moderation'

interface ModeratedCoursesListProps {
  courses: ModerationCourse[]
}

export const ModeratedCoursesList = ({ courses }: ModeratedCoursesListProps) => {
  if (courses.length === 0) return null

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="text-secondary" size={24} />
        <h3 className="text-xl font-bold text-text-main">Moji moderirani predmeti</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
            className="bg-surface border border-border p-5 hover:border-secondary transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {course.programName || 'Predmet'}
                </span>
                
                {course.pendingMaterialsCount > 0 ? (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1 border border-amber-200">
                    <AlertCircle size={12} />
                    {course.pendingMaterialsCount} v čakanju
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-sm font-medium flex items-center gap-1 border border-green-200">
                    <CheckCircle2 size={12} />
                    Pregledano
                  </span>
                )}
              </div>

              <h4 className="font-bold text-text-main text-lg mb-1">{course.name}</h4>
              <p className="text-xs text-text-muted">
                Skupno število gradiv: {course.totalMaterialsCount}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-secondary">
              <span>Odpri moderacijo predmeta</span>
              <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
