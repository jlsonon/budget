import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeName =
  | 'sakura'
  | 'moonlight'
  | 'matcha'
  | 'peach'
  | 'ocean'
  | 'cloud'
  | 'halloween'
  | 'christmas'
  | 'strawberry'
  | 'cat-cafe'
  | 'cozy-cafe'
  | 'night-sky'
  | 'spring'
  | 'winter'

export interface ThemeInfo {
  id: ThemeName
  name: string
  emoji: string
  colors: [string, string, string]
  isDark?: boolean
}

export const THEMES: ThemeInfo[] = [
  { id: 'sakura', name: 'Sakura', emoji: '', colors: ['#F9A8D4', '#A78BFA', '#FAFAFA'] },
  { id: 'strawberry', name: 'Strawberry', emoji: '', colors: ['#FB7185', '#FDA4AF', '#FFF1F2'] },
  { id: 'matcha', name: 'Matcha', emoji: '', colors: ['#86EFAC', '#6EE7B7', '#FAFAFA'] },
  { id: 'peach', name: 'Peach', emoji: '', colors: ['#FDBA74', '#FCA5A5', '#FAFAFA'] },
  { id: 'ocean', name: 'Ocean', emoji: '', colors: ['#67AED7', '#22D3EE', '#FAFAFA'] },
  { id: 'cloud', name: 'Cloud', emoji: '', colors: ['#93C5FD', '#C4B5FD', '#FAFAFA'] },
  { id: 'spring', name: 'Spring', emoji: '', colors: ['#A3E635', '#BEF264', '#F7FEE7'] },
  { id: 'winter', name: 'Winter', emoji: '', colors: ['#7DD3FC', '#BAE6FD', '#F0F9FF'] },
  { id: 'cat-cafe', name: 'Cat Café', emoji: '', colors: ['#D4A574', '#E8C9A0', '#FDF6EC'] },
  { id: 'cozy-cafe', name: 'Cozy Café', emoji: '', colors: ['#A0785C', '#D4A574', '#FAF5F0'] },
  { id: 'moonlight', name: 'Moonlight', emoji: '', colors: ['#C4B5FD', '#818CF8', '#0F172A'], isDark: true },
  { id: 'night-sky', name: 'Night Sky', emoji: '', colors: ['#818CF8', '#C084FC', '#0F0F1A'], isDark: true },
  { id: 'halloween', name: 'Halloween', emoji: '', colors: ['#F97316', '#A855F7', '#1C1917'], isDark: true },
  { id: 'christmas', name: 'Christmas', emoji: '', colors: ['#EF4444', '#22C55E', '#FEF2F2'] },
]

interface ThemeState {
  theme: ThemeName
  darkMode: boolean
  soundsEnabled: boolean
  animationsEnabled: boolean
  setTheme: (theme: ThemeName) => void
  toggleDarkMode: () => void
  toggleSounds: () => void
  toggleAnimations: () => void
  initialize: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'sakura',
      darkMode: false,
      soundsEnabled: false,
      animationsEnabled: true,
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        // Apply dark class for dark themes
        const themeInfo = THEMES.find((t: any) => t.id === theme)
        if (themeInfo?.isDark) {
          document.documentElement.classList.add('dark')
          set({ theme, darkMode: true })
        } else {
          if (!get().darkMode || themeInfo) {
            document.documentElement.classList.remove('dark')
            set({ theme, darkMode: false })
          } else {
            set({ theme })
          }
        }
      },
      toggleDarkMode: () => {
        const next = !get().darkMode
        document.documentElement.classList.toggle('dark', next)
        set({ darkMode: next })
      },
      toggleSounds: () => set((state) => ({ soundsEnabled: !state.soundsEnabled })),
      toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),
      initialize: () => {
        const saved = JSON.parse(localStorage.getItem('mochi-theme') || '{}')
        if (saved.state?.darkMode) {
          document.documentElement.classList.add('dark')
        }
        if (saved.state?.theme && saved.state.theme !== 'sakura') {
          document.documentElement.setAttribute('data-theme', saved.state.theme)
        }
        // Also handle dark themes
        const themeInfo = THEMES.find((t: any) => t.id === saved.state?.theme)
        if (themeInfo?.isDark) {
          document.documentElement.classList.add('dark')
        }
      },
    }),
    { name: 'mochi-theme' }
  )
)
