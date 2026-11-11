export interface ScheduleEntry {
  id: number
  userId: number
  courseTermId?: number | null
  title: string
  type?: string
  dayOfWeek: number // 1 = Monday ... 7 = Sunday
  startTime: string // "08:00"
  endTime: string   // "10:00"
  location?: string | null
}

export interface CourseTerm {
  id: number
  courseId: number
  courseName?: string | null
  title: string
  type: string
  group?: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
  location?: string | null
  isInUserSchedule: boolean
}

export interface CreateScheduleEntryData {
  title: string
  type?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  location?: string | null
}

export interface CreateCourseTermData {
  title: string
  type: string
  group?: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
  location?: string | null
}

export interface FreeTimeInterval {
  startTime: string
  endTime: string
  durationMinutes: number
}

export interface DayFreeTime {
  dayOfWeek: number
  freeIntervals: FreeTimeInterval[]
}

export interface UserScheduleComparison {
  userId: number
  userName: string
  entries: ScheduleEntry[]
}

export interface CompareScheduleResult {
  freeIntervals: FreeTimeInterval[]
  userSchedules: UserScheduleComparison[]
}

export interface CompareWeeklyScheduleResult {
  weeklyFreeIntervals: DayFreeTime[]
  userSchedules: UserScheduleComparison[]
}

export interface CourseStudent {
  id: number
  name: string
  email: string
}
