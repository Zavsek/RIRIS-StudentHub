import { create } from 'zustand'
import type { Material } from '../models/material'
import { useAuthStore } from './authStore'

interface MaterialState {
  materials: Material[]
  isLoading: boolean
  error: string | null

  fetchMaterials: (courseId: number) => Promise<void>
  uploadMaterial: (courseId: number, title: string, description: string, file: File) => Promise<void>
  deleteMaterial: (courseId: number, materialId: number) => Promise<void>
  rateMaterial: (courseId: number, materialId: number, rating: number) => Promise<void>
  updateMaterialInStore: (material: Material) => void
}

function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().tokens?.accessToken
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const useMaterialStore = create<MaterialState>((set) => ({
  materials: [],
  isLoading: false,
  error: null,

  fetchMaterials: async (courseId: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/materials`, {
        headers: getAuthHeader()
      })
      if (!res.ok) throw new Error('Napaka pri pridobivanju gradiv')
      const materials = await res.json() as Material[]
      set({ materials, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  uploadMaterial: async (courseId: number, title: string, description: string, file: File) => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()
      formData.append('title', title)
      if (description) formData.append('description', description)
      formData.append('file', file)

      const res = await fetch(`/api/courses/${courseId}/materials`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Napaka pri nalaganju gradiva')
      }
      
      const newMaterial = await res.json() as Material
      set(state => ({ materials: [newMaterial, ...state.materials], isLoading: false }))
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  deleteMaterial: async (courseId: number, materialId: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/materials/${materialId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      if (!res.ok) throw new Error('Napaka pri brisanju gradiva')
      
      set(state => ({
        materials: state.materials.filter(m => m.id !== materialId),
        isLoading: false
      }))
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  rateMaterial: async (courseId: number, materialId: number, rating: number) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/materials/${materialId}/rate`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka pri ocenjevanju gradiva' }))
        throw new Error(err.message || 'Napaka pri ocenjevanju gradiva')
      }
      const summary = await res.json() as { averageRating: number | null, ratingCount: number, userRating: number | null }
      set(state => ({
        materials: state.materials.map(m =>
          m.id === materialId
            ? { ...m, averageRating: summary.averageRating, ratingCount: summary.ratingCount, userRating: summary.userRating }
            : m
        )
      }))
    } catch (e: any) {
      set({ error: e.message })
      throw e
    }
  },

  updateMaterialInStore: (material: Material) => {
    set(state => ({
      materials: state.materials.map(m => m.id === material.id ? material : m)
    }))
  }
}))
