import { create } from 'zustand'

export interface UISlice {
  isAddModalOpen: boolean
  defaultModalType: 'expense' | 'income'
  isReceiptModalOpen: boolean
  isAIChatModalOpen: boolean
  setAddModalOpen: (open: boolean, type?: 'expense' | 'income') => void
  setReceiptModalOpen: (open: boolean) => void
  setAIChatModalOpen: (open: boolean) => void
}

export const useUIStore = create<UISlice>()((set) => ({
  isAddModalOpen: false,
  defaultModalType: 'expense',
  isReceiptModalOpen: false,
  isAIChatModalOpen: false,
  setAddModalOpen: (open, type) => set({ isAddModalOpen: open, defaultModalType: type ?? 'expense' }),
  setReceiptModalOpen: (open) => set({ isReceiptModalOpen: open }),
  setAIChatModalOpen: (open) => set({ isAIChatModalOpen: open }),
}))
