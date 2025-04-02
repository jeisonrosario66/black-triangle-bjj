import { create } from "zustand";

interface UIState {
  isAddNodeActive: boolean;
  setIsAddNodeActive: (active: boolean) => void;

  isLoadingFirestore: boolean;
  setIsLoadingFirestore: (loading: boolean) => void;


  activeStep: number;
  setActiveStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

}

const useUIStore = create<UIState>((set) => ({
  isAddNodeActive: false,
  setIsAddNodeActive: (active) => set({ isAddNodeActive: active }),

  isLoadingFirestore: false,
  setIsLoadingFirestore(loading) {
    set({ isLoadingFirestore: loading })
  },

  activeStep: 0,
  setActiveStep(step) { set({ activeStep: step }) },
  nextStep: () => set((state) => ({ activeStep: state.activeStep + 1 })),
  prevStep: () => set((state) => ({ activeStep: Math.max(0, state.activeStep - 1) })),
}));

export default useUIStore;


// const [activeStep, setActiveStep] = React.useState(0);
// const [skipped, setSkipped] = React.useState(new Set<number>());
