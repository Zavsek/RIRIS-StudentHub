import { create } from 'zustand'
import type { UserProfile } from '../models/userProfile'
import { useAuthStore } from './authStore'

interface UserProfileState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null

  fetchProfile: () => Promise<void>
  updateActiveCourses: (courseIds: number[]) => Promise<void>
  removeActiveCourse: (courseId: number) => Promise<void>
}

function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().tokens?.accessToken
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/user/profile', {
        headers: getAuthHeader()
      })
      if (!res.ok) throw new Error('Napaka pri pridobivanju profila')
      const profile = await res.json() as UserProfile
      set({ profile, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  updateActiveCourses: async (courseIds: number[]) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/user/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ courseIds })
      })
      if (!res.ok) throw new Error('Napaka pri posodabljanju predmetov')
      
      set(state => {
        if (!state.profile) return { isLoading: false }
        return { isLoading: false }
      })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  removeActiveCourse: async (courseId: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/user/courses/${courseId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      if (!res.ok) throw new Error('Napaka pri odstranjevanju predmeta')
      
      set(state => {
        if (!state.profile) return { isLoading: false }
        return { 
          profile: {
            ...state.profile,
            activeCourses: state.profile.activeCourses.filter(c => c.id !== courseId)
          },
          isLoading: false 
        }
      })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  }
}))
