import { create } from 'zustand'

export type KawaiiTheme = 'sakura' | 'matcha' | 'peach' | 'ocean' | 'cloud' | 'strawberry' | 'moonlight' | 'cozy-cafe'

export interface UISlice {
  isAddModalOpen: boolean
  defaultModalType: 'expense' | 'income'
  isReceiptModalOpen: boolean
  isAIChatModalOpen: boolean
  theme: KawaiiTheme
  setAddModalOpen: (open: boolean, type?: 'expense' | 'income') => void
  setReceiptModalOpen: (open: boolean) => void
  setAIChatModalOpen: (open: boolean) => void
  setTheme: (theme: KawaiiTheme) => void
}

const initialTheme = (localStorage.getItem('mochi_theme') as KawaiiTheme) || 'sakura'
document.documentElement.setAttribute('data-theme', initialTheme)

export const useUIStore = create<UISlice>()((set) => ({
  isAddModalOpen: false,
  defaultModalType: 'expense',
  isReceiptModalOpen: false,
  isAIChatModalOpen: false,
  theme: initialTheme,
  setAddModalOpen: (open, type) => set({ isAddModalOpen: open, defaultModalType: type ?? 'expense' }),
  setReceiptModalOpen: (open) => set({ isReceiptModalOpen: open }),
  setAIChatModalOpen: (open) => set({ isAIChatModalOpen: open }),
  setTheme: (theme) => {
    localStorage.setItem('mochi_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'moonlight') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme })
  },
}))
