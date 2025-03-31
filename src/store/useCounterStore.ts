import { create } from "zustand";

interface UIState {
  isAddNodeActive: boolean;
  setIsAddNodeActive: (active: boolean) => void;

  isLoadingFirestore: boolean;
  setIsLoadingFirestore: (loading: boolean) => void

}

const useUIStore = create<UIState>((set) => ({
  isAddNodeActive: false,
  setIsAddNodeActive: (active) => set({ isAddNodeActive: active }),

  isLoadingFirestore: false,
  setIsLoadingFirestore(loading) {
    set({ isLoadingFirestore: loading })
  },



}));

export default useUIStore;
