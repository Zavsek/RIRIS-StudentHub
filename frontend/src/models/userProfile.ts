import type { Course } from './academic'

export interface UserProfile {
  id: number
  email: string
  name: string
  activeCourses: Course[]
}
