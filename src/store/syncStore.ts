import { create } from 'zustand'
import { DailyMission, Achievement, Streak } from '../types'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

export interface SyncState {
  status: SyncStatus
  isOnline: boolean
  lastSyncedAt: Date | null
  pendingWritesCount: number
  error: string | null
  missions: DailyMission[]
  achievements: Achievement[]
  streaks: Streak[]

  setStatus: (status: SyncStatus) => void
  setIsOnline: (online: boolean) => void
  setLastSyncedAt: (date: Date) => void
  incrementPending: () => void
  decrementPending: () => void
  setError: (error: string | null) => void
  setMissions: (missions: DailyMission[]) => void
  completeMission: (id: string) => void
  setAchievements: (achievements: Achievement[]) => void
  setStreaks: (streaks: Streak[]) => void
  incrementStreak: (type: Streak['type']) => void
}

export const useSyncStore = create<SyncState>()((set) => ({
  status: typeof navigator !== 'undefined' && navigator.onLine ? 'synced' : 'offline',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastSyncedAt: new Date(),
  pendingWritesCount: 0,
  error: null,
  missions: [],
  achievements: [],
  streaks: [],

  setStatus: (status) => set({ status }),
  setIsOnline: (isOnline) => set({ isOnline, status: isOnline ? 'synced' : 'offline' }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt, status: 'synced' }),
  incrementPending: () => set((state) => ({ pendingWritesCount: state.pendingWritesCount + 1, status: 'syncing' })),
  decrementPending: () =>
    set((state) => {
      const nextCount = Math.max(0, state.pendingWritesCount - 1)
      return { pendingWritesCount: nextCount, status: nextCount === 0 ? 'synced' : 'syncing' }
    }),
  setError: (error) => set({ error, status: error ? 'error' : 'synced' }),
  setMissions: (missions) => set({ missions }),
  completeMission: (id) =>
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === id ? { ...m, status: 'completed' as const, completedAt: new Date().toISOString() } : m
      ),
    })),
  setAchievements: (achievements) => set({ achievements }),
  setStreaks: (streaks) => set({ streaks }),
  incrementStreak: (type) =>
    set((state) => ({
      streaks: state.streaks.map((st) =>
        st.type === type
          ? {
              ...st,
              current: st.current + 1,
              longest: Math.max(st.longest, st.current + 1),
              lastActiveDate: new Date().toISOString().split('T')[0],
            }
          : st
      ),
    })),
}))
