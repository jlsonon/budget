import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile } from '../types'

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
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),
      updateUser: (updates) =>
        set((s: AuthState) => ({
          user: s.user ? { ...s.user, ...updates, updatedAt: new Date().toISOString() } : null,
        })),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, isAuthenticated: false, error: null }),
      loginAsGuest: () => {
        const guestUser: UserProfile = {
          id: `guest_${Date.now()}`,
          name: 'Guest User',
          email: 'guest@mochimoney.app',
          currency: 'PHP',
          language: 'en',
          theme: 'sakura',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set({ user: guestUser, isAuthenticated: true, error: null })
      },
    }),
    { name: 'mochi-auth', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
)
