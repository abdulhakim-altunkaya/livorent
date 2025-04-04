import { create } from 'zustand';

const useUserStore = create((set) => ({
  cachedUserData: {},          // Stores user data globally
  setCachedUserData: (data) => set({ cachedUserData: data }),  // Updates cache
  clearCachedUserData: () => set({ cachedUserData: {} }),      // Clears cache
}));

export default useUserStore;