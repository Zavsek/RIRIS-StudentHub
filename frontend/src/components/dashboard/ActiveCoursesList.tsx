import { Book } from 'lucide-react'
import type { Course } from '../../models/academic'

interface ActiveCoursesListProps {
  courses: Course[]
}

export const ActiveCoursesList = ({ courses }: ActiveCoursesListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map(course => (
        <div 
          key={course.id} 
          className="bg-surface border border-border p-5 hover:border-primary/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <Book size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-text-main group-hover:text-primary transition-colors line-clamp-2">
                {course.name}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-text-muted flex-wrap">
                {course.year && <span>{course.year}. letnik</span>}
                {course.year && course.semester && <span>•</span>}
                {course.semester && <span>{course.semester} semester</span>}
                {(course.year || course.semester) && course.ects && <span>•</span>}
                {course.ects && <span>{course.ects} ECTS</span>}
              </div>
              {course.professor && (
                <div className="mt-1 text-sm text-text-muted">
                  Nosilec: {course.professor}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
