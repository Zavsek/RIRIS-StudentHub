import { create } from 'zustand'
import type { Obligation, CreateObligationData, UpdateObligationData } from '../models/calendar'
import { useAuthStore } from './authStore'

interface CalendarState {
  courseObligations: Obligation[]
  allObligations: Obligation[]
  isLoading: boolean
  error: string | null

  fetchCourseObligations: (courseId: number) => Promise<void>
  fetchAllObligations: () => Promise<void>
  createObligation: (courseId: number, data: CreateObligationData) => Promise<Obligation>
  updateObligation: (courseId: number, obligationId: number, data: UpdateObligationData) => Promise<Obligation>
  deleteObligation: (courseId: number, obligationId: number) => Promise<void>
}

function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().tokens?.accessToken
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const useCalendarStore = create<CalendarState>((set) => ({
  courseObligations: [],
  allObligations: [],
  isLoading: false,
  error: null,

  fetchCourseObligations: async (courseId: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/obligations`, { headers: getAuthHeader() })
      if (!res.ok) throw new Error('Napaka pri nalaganju obveznosti')
      const data = await res.json() as Obligation[]
      set({ courseObligations: data, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  fetchAllObligations: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/user/obligations', { headers: getAuthHeader() })
      if (!res.ok) throw new Error('Napaka pri nalaganju rokovnika')
      const data = await res.json() as Obligation[]
      set({ allObligations: data, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  createObligation: async (courseId: number, data: CreateObligationData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/obligations`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka pri vnosu obveznosti' }))
        throw new Error(err.message || 'Napaka pri vnosu obveznosti')
      }
      const newOb = await res.json() as Obligation
      set(state => ({
        courseObligations: [...state.courseObligations, newOb].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        allObligations: [...state.allObligations, newOb].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        isLoading: false
      }))
      return newOb
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  updateObligation: async (courseId: number, obligationId: number, data: UpdateObligationData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/obligations/${obligationId}`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka pri posodobitvi obveznosti' }))
        throw new Error(err.message || 'Napaka pri posodobitvi obveznosti')
      }
      const updated = await res.json() as Obligation
      set(state => ({
        courseObligations: state.courseObligations.map(o => o.id === obligationId ? updated : o).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        allObligations: state.allObligations.map(o => o.id === obligationId ? updated : o).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        isLoading: false
      }))
      return updated
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  deleteObligation: async (courseId: number, obligationId: number) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/obligations/${obligationId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      if (!res.ok) throw new Error('Napaka pri brisanju obveznosti')
      set(state => ({
        courseObligations: state.courseObligations.filter(o => o.id !== obligationId),
        allObligations: state.allObligations.filter(o => o.id !== obligationId)
      }))
    } catch (e: any) {
      set({ error: e.message })
      throw e
    }
  }
}))
