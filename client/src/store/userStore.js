import { create } from 'zustand';

const useUserStore = create((set) => ({
  // user data. From BtmProfile to BtmProfileUpdate component
  cachedUserData: {},
  setCachedUserData: (data) => set({ cachedUserData: data }),
  clearCachedUserData: () => set({ cachedUserData: {} }),

  // seller data. From BtmItem to BtmSeller component
  cachedSellerData: {},
  setCachedSellerData: (data) => set({ cachedSellerData: data }),
  clearCachedSellerData: () => set({ cachedSellerData: {} }),

  // item data. From BtmProfile to BtmProfileAdUpdate component.
  cachedItemData: {},          // Stores item data globally
  setCachedItemData: (data) => set({ cachedItemData: data }),  // Updates item cache
  clearCachedItemData: () => set({ cachedItemData: {} }),      // Clears item cache
}));

export default useUserStore;