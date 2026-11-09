import { create } from 'zustand'
import type { Faculty, Program, Course } from '../models/academic'

interface AcademicState {
  faculties: Faculty[]
  programs: Record<number, Program[]>
  courses: Record<number, Course[]>
  isLoading: boolean
  error: string | null

  fetchFaculties: () => Promise<void>
  fetchPrograms: (facultyId: number) => Promise<void>
  fetchCourses: (programId: number) => Promise<void>
}

export const useAcademicStore = create<AcademicState>((set, get) => ({
  faculties: [],
  programs: {},
  courses: {},
  isLoading: false,
  error: null,

  fetchFaculties: async () => {
    if (get().faculties.length > 0) return
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/academic/faculties')
      if (!res.ok) throw new Error('Napaka pri pridobivanju fakultet')
      const faculties = await res.json() as Faculty[]
      set({ faculties, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  fetchPrograms: async (facultyId: number) => {
    if (get().programs[facultyId]) return
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/academic/programs/${facultyId}`)
      if (!res.ok) throw new Error('Napaka pri pridobivanju smeri')
      const programs = await res.json() as Program[]
      set(state => ({
        programs: { ...state.programs, [facultyId]: programs },
        isLoading: false
      }))
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  fetchCourses: async (programId: number) => {
    if (get().courses[programId]) return
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/academic/courses/${programId}`)
      if (!res.ok) throw new Error('Napaka pri pridobivanju predmetov')
      const courses = await res.json() as Course[]
      set(state => ({
        courses: { ...state.courses, [programId]: courses },
        isLoading: false
      }))
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  }
}))
