import { create } from 'zustand'
import type {
  ScheduleEntry,
  CourseTerm,
  CourseStudent,
  FreeTimeInterval,
  CompareScheduleResult,
  CompareWeeklyScheduleResult,
  CreateScheduleEntryData,
  CreateCourseTermData
} from '../models/schedule'
import { useAuthStore } from './authStore'

interface ScheduleState {
  mySchedule: ScheduleEntry[]
  courseTerms: CourseTerm[]
  courseStudents: CourseStudent[]
  colleagues: CourseStudent[]
  freeIntervals: FreeTimeInterval[] | null
  comparisonResult: CompareScheduleResult | null
  weeklyComparisonResult: CompareWeeklyScheduleResult | null
  hasSearchedComparison: boolean
  isLoading: boolean
  error: string | null

  fetchMySchedule: () => Promise<void>
  addScheduleEntry: (data: CreateScheduleEntryData) => Promise<ScheduleEntry>
  deleteScheduleEntry: (id: number) => Promise<void>
  importCourseTerm: (courseTermId: number) => Promise<ScheduleEntry>
  fetchCourseTerms: (courseId: number) => Promise<void>
  createCourseTerm: (courseId: number, data: CreateCourseTermData) => Promise<CourseTerm>
  deleteCourseTerm: (courseId: number, termId: number) => Promise<void>
  fetchCourseStudents: (courseId: number) => Promise<void>
  fetchColleagues: (courseId?: number) => Promise<void>
  compareFreeTime: (courseId: number, userIds: number[], dayOfWeek: number) => Promise<CompareScheduleResult>
  compareWeeklySchedule: (userIds: number[]) => Promise<CompareWeeklyScheduleResult>
  clearComparison: () => void
}

function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().tokens?.accessToken
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  mySchedule: [],
  courseTerms: [],
  courseStudents: [],
  colleagues: [],
  freeIntervals: null,
  comparisonResult: null,
  weeklyComparisonResult: null,
  hasSearchedComparison: false,
  isLoading: false,
  error: null,

  fetchMySchedule: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/schedule', { headers: getAuthHeader() })
      if (!res.ok) throw new Error('Napaka pri nalaganju osebnega urnika')
      const data = await res.json() as ScheduleEntry[]
      set({ mySchedule: data, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  addScheduleEntry: async (data: CreateScheduleEntryData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka pri vnosu termina' }))
        throw new Error(err.message || 'Napaka pri vnosu termina')
      }
      const newEntry = await res.json() as ScheduleEntry
      set(state => ({
        mySchedule: [...state.mySchedule, newEntry].sort((a, b) =>
          a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
        ),
        isLoading: false
      }))
      return newEntry
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  deleteScheduleEntry: async (id: number) => {
    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      if (!res.ok) throw new Error('Napaka pri brisanju termina')
      set(state => ({
        mySchedule: state.mySchedule.filter(e => e.id !== id),
        courseTerms: state.courseTerms.map(t =>
          state.mySchedule.find(s => s.id === id)?.courseTermId === t.id
            ? { ...t, isInUserSchedule: false }
            : t
        )
      }))
    } catch (e: any) {
      set({ error: e.message })
      throw e
    }
  },

  importCourseTerm: async (courseTermId: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/schedule/import-term/${courseTermId}`, {
        method: 'POST',
        headers: getAuthHeader()
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka pri uvozu termina' }))
        throw new Error(err.message || 'Napaka pri uvozu termina')
      }
      const entry = await res.json() as ScheduleEntry
      set(state => ({
        mySchedule: [...state.mySchedule.filter(s => s.id !== entry.id), entry].sort((a, b) =>
          a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
        ),
        courseTerms: state.courseTerms.map(t =>
          t.id === courseTermId ? { ...t, isInUserSchedule: true } : t
        ),
        isLoading: false
      }))
      return entry
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  fetchCourseTerms: async (courseId: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/terms`, { headers: getAuthHeader() })
      if (!res.ok) throw new Error('Napaka pri nalaganju terminov predmeta')
      const data = await res.json() as CourseTerm[]
      set({ courseTerms: data, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  createCourseTerm: async (courseId: number, data: CreateCourseTermData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/terms`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka pri vnosu termina predmeta' }))
        throw new Error(err.message || 'Napaka pri vnosu termina predmeta')
      }
      const newTerm = await res.json() as CourseTerm
      set(state => ({
        courseTerms: [...state.courseTerms, newTerm].sort((a, b) =>
          a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
        ),
        isLoading: false
      }))
      return newTerm
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  deleteCourseTerm: async (courseId: number, termId: number) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/terms/${termId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      if (!res.ok) throw new Error('Napaka pri brisanju termina predmeta')
      set(state => ({
        courseTerms: state.courseTerms.filter(t => t.id !== termId)
      }))
    } catch (e: any) {
      set({ error: e.message })
      throw e
    }
  },

  fetchCourseStudents: async (courseId: number) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/students`, { headers: getAuthHeader() })
      if (!res.ok) throw new Error('Napaka pri nalaganju študentov predmeta')
      const data = await res.json() as CourseStudent[]
      set({ courseStudents: data })
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  fetchColleagues: async (courseId?: number) => {
    try {
      const url = courseId ? `/api/schedule/colleagues?courseId=${courseId}` : '/api/schedule/colleagues'
      const res = await fetch(url, { headers: getAuthHeader() })
      if (!res.ok) throw new Error('Napaka pri nalaganju sošolcev')
      const data = await res.json() as CourseStudent[]
      set({ colleagues: data })
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  compareFreeTime: async (courseId: number, userIds: number[], dayOfWeek: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/schedule/compare`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, dayOfWeek })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka pri primerjavi urnikov' }))
        throw new Error(err.message || 'Napaka pri primerjavi urnikov')
      }
      const raw = await res.json()
      const result: CompareScheduleResult = Array.isArray(raw)
        ? { freeIntervals: raw, userSchedules: [] }
        : { freeIntervals: raw.freeIntervals || [], userSchedules: raw.userSchedules || [] }

      set({
        freeIntervals: result.freeIntervals,
        comparisonResult: result,
        hasSearchedComparison: true,
        isLoading: false
      })
      return result
    } catch (e: any) {
      set({ error: e.message, isLoading: false, hasSearchedComparison: true })
      throw e
    }
  },

  compareWeeklySchedule: async (userIds: number[]) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/schedule/compare-weekly', {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka pri primerjavi urnikov' }))
        throw new Error(err.message || 'Napaka pri primerjavi urnikov')
      }
      const raw = await res.json()
      const result: CompareWeeklyScheduleResult = {
        weeklyFreeIntervals: raw.weeklyFreeIntervals || [],
        userSchedules: raw.userSchedules || []
      }
      set({
        weeklyComparisonResult: result,
        hasSearchedComparison: true,
        isLoading: false
      })
      return result
    } catch (e: any) {
      set({ error: e.message, isLoading: false, hasSearchedComparison: true })
      throw e
    }
  },

  clearComparison: () => {
    set({
      freeIntervals: null,
      comparisonResult: null,
      weeklyComparisonResult: null,
      hasSearchedComparison: false
    })
  }
}))
