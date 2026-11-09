import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ApiErrorBody, AuthSession, AuthTokens, AuthUser, LoginCredentials, RegisterCredentials } from '../models/auth'

interface AuthState {
  user: AuthUser | null
  tokens: AuthTokens | null
  error: string | null
  isSubmitting: boolean
  hasHydrated: boolean
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (credentials: RegisterCredentials) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  setHasHydrated: (value: boolean) => void
}

const unreachableMessage = 'Strežnik ni dosegljiv.'

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json() as ApiErrorBody
    return body.message || 'Zahtevek ni uspel.'
  } catch {
    return 'Zahtevek ni uspel.'
  }
}

async function postSession(path: string, body: LoginCredentials | RegisterCredentials): Promise<AuthSession | string> {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      return await readErrorMessage(response)
    }
    return await response.json() as AuthSession
  } catch {
    return unreachableMessage
  }
}

function applySession(
  set: (partial: Partial<AuthState>) => void,
  result: AuthSession | string,
): boolean {
  if (typeof result === 'string') {
    set({ error: result, isSubmitting: false })
    return false
  }

  set({ user: result.user, tokens: result.tokens, error: null, isSubmitting: false })
  return true
}

async function refreshStoredSession(refreshToken: string) {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) {
      useAuthStore.setState({ user: null, tokens: null })
      return
    }

    const session = await response.json() as AuthSession
    useAuthStore.setState({ user: session.user, tokens: session.tokens, error: null })
  } catch {
    useAuthStore.setState({ user: null, tokens: null })
  }
}

function keepSessionFresh(tokens: AuthTokens | null) {
  if (!tokens) return
  const expiresAt = new Date(tokens.accessTokenExpiresAt).getTime()
  if (Number.isNaN(expiresAt) || expiresAt > Date.now()) return
  void refreshStoredSession(tokens.refreshToken)
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  tokens: null,
  error: null,
  isSubmitting: false,
  hasHydrated: false,
  setHasHydrated: (value) => set({ hasHydrated: value }),
  clearError: () => set({ error: null }),
  login: async (credentials) => {
    set({ isSubmitting: true, error: null })
    const result = await postSession('/api/auth/login', credentials)
    return applySession(set, result)
  },
  register: async (credentials) => {
    set({ isSubmitting: true, error: null })
    const result = await postSession('/api/auth/register', credentials)
    return applySession(set, result)
  },
  logout: async () => {
    const refreshToken = get().tokens?.refreshToken
    if (refreshToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined)
    }
    set({ user: null, tokens: null, error: null, isSubmitting: false })
  },
    }),
    {
      name: 'studenthub-auth',
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
        keepSessionFresh(state?.tokens ?? null)
      },
    },
  ),
)
