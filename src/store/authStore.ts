import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile } from '../types'

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'demo-user-123',
  name: 'Mochi Friend',
  email: 'hello@mochimoney.app',
  currency: 'PHP',
  language: 'en',
  theme: 'sakura',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: UserProfile | null) => void
  updateUser: (updates: Partial<UserProfile>) => void
  setAuthenticated: (value: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  loginAsGuest: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEFAULT_DEMO_USER,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),
      updateUser: (updates) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...updates, updatedAt: new Date().toISOString() } : null,
        })),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, isAuthenticated: false, error: null }),
      loginAsGuest: () => set({ user: DEFAULT_DEMO_USER, isAuthenticated: true, error: null }),
    }),
    { name: 'mochi-auth', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
)
