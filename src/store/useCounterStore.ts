import { create } from "zustand";
import { Vector3Tuple } from "three";
import {
  NodeViewData,
  UserLoginData,
  NodeOptionFirestone,
  DagMode,
  cacheUser,
  GraphLink,
} from "@src/context/index";
import { parseCacheArray } from "@src/utils/index";

const systemCacheLoadedLinks = parseCacheArray(cacheUser.systemsCacheNameLinks);
const systemCacheLoadedNodes = parseCacheArray(cacheUser.systemsCacheNameNodes);
// -------------------------------------------------------------------------
// Definición del estado de datos globales
// -------------------------------------------------------------------------
interface GlobalData {
  userLoginData: UserLoginData;
  setUserLoginDAta: (data: UserLoginData) => void;

  languageGlobal: string;
  setLanguageGlobal: (language: string) => void;

  nodeViewData: NodeViewData;
  setNodeViewData: (data: NodeViewData) => void;

  documentsFirestore: NodeOptionFirestone[];
  setDocumentsFirestore: (data: NodeOptionFirestone[]) => void;

  dagModeConfig: DagMode;
  setDagModeConfig: (dagMode: DagMode) => void;

  dagLevelDistanceConfig: number;
  setDagLevelDistanceConfig: (dagLevel: number) => void;

  systemBjjSelectedNodes: string[];
  setSystemBjjSelectedNodes: (systemNodes: string[]) => void;

  systemBjjSelectedLinks: string[];
  setSystemBjjSelectedLinks?: (systemLinks: string[]) => void;

  linksData: GraphLink[];
  setLinksData: (links: GraphLink[]) => void;
}

// -------------------------------------------------------------------------
// Definición del estado de la UI
// -------------------------------------------------------------------------
interface UIState {
  isAddNodeActive: boolean;
  setIsAddNodeActive: (active: boolean) => void;

  isLoginWindowActive: boolean;
  setIsLoginWindowActive: (active: boolean) => void;

  isLoadingFirestore: boolean;
  setIsLoadingFirestore: (loading: boolean) => void;

  isUploadFirestore: boolean;
  setIsUploadFirestore: (upload: boolean) => void;

  isUserLogin: boolean;
  setIsUserLogin: (login: boolean) => void;

  isNodeAddViewActive: boolean;
  setIsNodeAddViewActive: (nodeAddView: boolean) => void;

  isNodeSceneViewActive: boolean;
  setIsNodeSceneViewActive: (nodeSceneView: boolean) => void;

  overlayDontShowAgain: boolean;
  setOverlayDontShowAgain: (dontShow: boolean) => void;

  isConfigWindowActive: boolean;
  setIsconfigWindowActive: (configWindow: boolean) => void;

  showFullGraph: boolean;
  setShowFullGraph: (show: boolean) => void;

  showAlert: boolean;
  alertMessage: string;
  alertSeverity: "success" | "info" | "warning" | "error";
  triggerAlert: (message: string, severity?: UIState["alertSeverity"]) => void;

  addNodeActiveStep: number;
  setaddNodeActiveStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  cameraBackup: { pos: Vector3Tuple; target: Vector3Tuple } | null;
  setCameraBackup: (pos: Vector3Tuple, target: Vector3Tuple) => void;
  clearCameraBackup: () => void;

  connectionViewerActiveStep: number | null;
  setConnectionViewerActiveStep: (viewerStep: number | null) => void;
}

// -------------------------------------------------------------------------
// Definición del estado para la validación por pasos
// -------------------------------------------------------------------------
interface StepValidationState {
  stepValidation: Record<string, boolean>;
  validateFns: Record<string, () => Promise<boolean>>;

  setValidateFn: (step: string, fn: () => Promise<boolean>) => void;
  runValidation: (step: string) => Promise<boolean>;
  runSequentialValidation: (steps: string[]) => Promise<boolean>;
}

// -------------------------------------------------------------------------
// Combina ambos estados en un único tipo de estado de aplicación
// -------------------------------------------------------------------------
type AppState = UIState & StepValidationState & GlobalData;

// -------------------------------------------------------------------------
// Creación del store usando Zustand
// -------------------------------------------------------------------------
const useUIStore = create<AppState>((set, get) => ({
  // --- Estado de la UI ---
  isAddNodeActive: false,
  setIsAddNodeActive: (active) => set({ isAddNodeActive: active }),

  isLoginWindowActive: false,
  setIsLoginWindowActive: (active) => set({ isLoginWindowActive: active }),

  isLoadingFirestore: false,
  setIsLoadingFirestore: (loading) => set({ isLoadingFirestore: loading }),

  isUploadFirestore: false,
  setIsUploadFirestore: (upload) => set({ isUploadFirestore: upload }),

  userLoginData: { displayName: "", email: "", photoURL: "" },
  setUserLoginDAta: (data) => set({ userLoginData: data }),

  isUserLogin: false,
  setIsUserLogin: (login) => set({ isUserLogin: login }),

  showAlert: false,
  alertMessage: "",
  alertSeverity: "success",

  isNodeAddViewActive: false,
  setIsNodeAddViewActive: (nodeView) => set({ isNodeAddViewActive: nodeView }),

  isNodeSceneViewActive: false,
  setIsNodeSceneViewActive: (nodeViewScene) =>
    set({ isNodeSceneViewActive: nodeViewScene }),

  overlayDontShowAgain: false,
  setOverlayDontShowAgain: (dontShow) =>
    set({ overlayDontShowAgain: dontShow }),

  languageGlobal: "",
  setLanguageGlobal: (language) => set({ languageGlobal: language }),

  isConfigWindowActive: false,
  setIsconfigWindowActive: (configWindow) =>
    set({ isConfigWindowActive: configWindow }),

  nodeViewData: { videoid: "", start: "", end: "" },
  setNodeViewData: (data) => set({ nodeViewData: data }),

  documentsFirestore: [],
  setDocumentsFirestore: (data) => set({ documentsFirestore: data }),

  dagModeConfig: cacheUser.dagMode,
  setDagModeConfig: (dagMode) => set({ dagModeConfig: dagMode }),

  dagLevelDistanceConfig: Number(cacheUser.dagLevelDistance),
  setDagLevelDistanceConfig: (dagLevel) =>
    set({ dagLevelDistanceConfig: dagLevel }),

  triggerAlert: (message, severity = "success") => {
    set({ showAlert: true, alertMessage: message, alertSeverity: severity });
    setTimeout(() => set({ showAlert: false }), 4000);
  },

  addNodeActiveStep: 0,
  setaddNodeActiveStep: (step) => set({ addNodeActiveStep: step }),

  nextStep: () =>
    set((state) => ({ addNodeActiveStep: state.addNodeActiveStep + 1 })),
  prevStep: () =>
    set((state) => ({
      addNodeActiveStep: Math.max(0, state.addNodeActiveStep - 1),
    })),

  // --- Estado de Validación por Pasos ---
  stepValidation: { step0: false, step1: false, step2: false },

  validateFns: {},

  setValidateFn: (step, fn) =>
    set((state) => ({
      validateFns: { ...state.validateFns, [step]: fn },
    })),

  runValidation: async (step) => {
    const fn = get().validateFns[step];
    if (!fn) return false;
    const isValid = await fn();
    set((state) => ({
      stepValidation: { ...state.stepValidation, [step]: isValid },
    }));
    return isValid;
  },

  runSequentialValidation: async (steps) => {
    for (const step of steps) {
      const isValid = await get().runValidation(step);
      if (!isValid) return false;
    }
    return true;
  },

  connectionViewerActiveStep: null,
  setConnectionViewerActiveStep: (viewerStep) =>
    set({ connectionViewerActiveStep: viewerStep }),

  cameraBackup: null,
  setCameraBackup: (pos, target) => set({ cameraBackup: { pos, target } }),
  clearCameraBackup: () => set({ cameraBackup: null }),

  // --- Estados de la UI adicionales ---
  showFullGraph: true,
  setShowFullGraph: (show) => set({ showFullGraph: show }),

  systemBjjSelectedNodes: systemCacheLoadedNodes,
  setSystemBjjSelectedNodes: (systemNodes) =>
    set({ systemBjjSelectedNodes: systemNodes }),

  systemBjjSelectedLinks: systemCacheLoadedLinks,
  setSystemBjjSelectedLinks: (systemLinks) =>
    set({ systemBjjSelectedLinks: systemLinks }),

  linksData: [],
  setLinksData: (links) => set({ linksData: links }),
}));

export default useUIStore;
