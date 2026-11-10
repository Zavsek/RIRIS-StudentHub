import { create } from 'zustand'
import type { Material } from '../models/material'
import type { MaterialStatus, ModerationCourse, ModeratorStatus } from '../models/moderation'
import { useAuthStore } from './authStore'
import { useMaterialStore } from './materialStore'

interface ModerationState {
  isModerator: boolean
  moderatedCourses: ModerationCourse[]
  isLoading: boolean
  error: string | null

  checkCourseModeration: (courseId: number) => Promise<boolean>
  setMaterialStatus: (courseId: number, materialId: number, status: MaterialStatus) => Promise<void>
  fetchModeratedCourses: () => Promise<void>
  assignModerator: (courseId: number, userId: number) => Promise<void>
  removeModerator: (courseId: number, userId: number) => Promise<void>
}

function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().tokens?.accessToken
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const useModerationStore = create<ModerationState>((set, get) => ({
  isModerator: false,
  moderatedCourses: [],
  isLoading: false,
  error: null,

  checkCourseModeration: async (courseId: number) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/moderation/check`, {
        headers: getAuthHeader()
      })
      if (!res.ok) {
        set({ isModerator: false })
        return false
      }
      const data = await res.json() as ModeratorStatus
      set({ isModerator: data.isModerator })
      return data.isModerator
    } catch {
      set({ isModerator: false })
      return false
    }
  },

  setMaterialStatus: async (courseId: number, materialId: number, status: MaterialStatus) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/materials/${materialId}/status`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka pri spreminjanju statusa' }))
        throw new Error(err.message || 'Napaka pri spreminjanju statusa')
      }

      const updated = await res.json() as Material
      useMaterialStore.getState().updateMaterialInStore(updated)
      set({ isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  fetchModeratedCourses: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/moderation/courses', {
        headers: getAuthHeader()
      })
      if (!res.ok) throw new Error('Napaka pri pridobivanju moderiranih predmetov')
      const courses = await res.json() as ModerationCourse[]
      set({ moderatedCourses: courses, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  assignModerator: async (courseId: number, userId: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/moderators`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      })
      if (!res.ok) throw new Error('Napaka pri dodelitvi moderatorja')
      await get().checkCourseModeration(courseId)
      set({ isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  removeModerator: async (courseId: number, userId: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/moderators/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      if (!res.ok) throw new Error('Napaka pri odvzemu moderatorja')
      await get().checkCourseModeration(courseId)
      set({ isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  }
}))
