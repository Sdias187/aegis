import { create } from 'zustand';

interface UIState {
  isGlobalSearchOpen: boolean;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isGlobalSearchOpen: false,
  openGlobalSearch: () => set({ isGlobalSearchOpen: true }),
  closeGlobalSearch: () => set({ isGlobalSearchOpen: false }),
}));
