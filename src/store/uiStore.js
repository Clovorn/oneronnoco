import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null,
  modalData: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}))
