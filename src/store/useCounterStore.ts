import { create } from "zustand";
import { Vector3Tuple } from "three";

import {
  NodeViewData,
  UserLoginData,
  NodeOptionFirestone,
  DagMode,
  cacheUser,
} from "@src/context/index";

// Verifica si en la cache exite un language escogido, de lo contrario toma el language por default
// const languageApp = localStorage.getItem(cacheUser.languageUser) ?? cacheUser.languageDefault

// Definición del estado de datos
interface GlobalData {
  // Datos del usuario autenticado
  userLoginData: UserLoginData;
  setUserLoginDAta: (data: UserLoginData) => void;

  // Indica el language escogido
  languageGlobal: string;
  setLanguageGlobal: (language: string) => void;

  // Datos del nodo activo
  nodeViewData: NodeViewData;
  setNodeViewData: (data: NodeViewData) => void;

  // Documentos Firestore
  documentsFirestore: NodeOptionFirestone[];
  setDocumentsFirestore: (data: NodeOptionFirestone[]) => void;

  dagModeConfig: DagMode;
  setDagModeConfig: (dagMode: DagMode) => void;

  dagLevelDistanceConfig: number;
  setDagLevelDistanceConfig: (dagLevel: number) => void;
}

// Definición del estado de la UI
interface UIState {
  // Indica si la interfaz de "Agregar Nodo" está activa
  isAddNodeActive: boolean;
  setIsAddNodeActive: (active: boolean) => void;

  // Indica si la interfaz de "Iniciar sesión" está activa
  isLoginWindowActive: boolean;
  setIsLoginWindowActive: (active: boolean) => void;

  // Indica si se está cargando información desde Firestore
  isLoadingFirestore: boolean;
  setIsLoadingFirestore: (loading: boolean) => void;

  // Indica si se está subiendo información hacia Firestore
  isUploadFirestore: boolean;
  setIsUploadFirestore: (upload: boolean) => void;

  // Indica si el usuario está autenticado
  isUserLogin: boolean;
  setIsUserLogin: (login: boolean) => void;

  // Indica si la ventana del nodo esta activa
  isNodeViewActive: boolean;
  setIsNodeViewActive: (nodeView: boolean) => void;

  // Indica si se debe mostrar el overlay de "Gestos de Navegación"
  overlayDontShowAgain: boolean;
  setOverlayDontShowAgain: (dontShow: boolean) => void;

  // Indica si la ventana de configuración esta activa
  isConfigWindowActive: boolean;
  setIsconfigWindowActive: (configWindow: boolean) => void;

  // Indica si se expande o colapsa el grafo
  showFullGraph: boolean;
  setShowFullGraph: (show: boolean) => void;

  // Estado y configuración de alertas
  showAlert: boolean;
  alertMessage: string;
  alertSeverity: "success" | "info" | "warning" | "error";
  triggerAlert: (message: string, severity?: UIState["alertSeverity"]) => void;

  // Indica el paso actual en el componente Stepper
  activeStep: number;
  // Función para asignar un paso específico
  setActiveStep: (step: number) => void;
  // Función para avanzar al siguiente paso
  nextStep: () => void;
  // Función para retroceder al paso anterior
  prevStep: () => void;

  // Backup de cámara al hacer zoom
  cameraBackup: {
    pos: Vector3Tuple;
    target: Vector3Tuple;
  } | null;
  setCameraBackup: (pos: Vector3Tuple, target: Vector3Tuple) => void;
  clearCameraBackup: () => void;
}

// Definición del estado para la validación por pasos
interface StepValidationState {
  // Objeto que almacena el estado de validación de cada paso
  // Ejemplo: { step0: false, step1: false, step2: false }
  stepValidation: Record<string, boolean>;
  // Objeto que almacena funciones de validación para cada paso
  // Cada función retorna una Promesa que resuelve en un boolean
  validateFns: Record<string, () => Promise<boolean>>;

  // Función para registrar la función de validación de un paso específico
  setValidateFn: (step: string, fn: () => Promise<boolean>) => void;
  // Función para ejecutar la validación de un paso específico y actualizar el estado
  runValidation: (step: string) => Promise<boolean>;
  // Función para ejecutar validaciones de forma secuencial para múltiples pasos
  runSequentialValidation: (steps: string[]) => Promise<boolean>;
}

// Combina ambos estados en un único tipo de estado de aplicación
type AppState = UIState & StepValidationState & GlobalData;

// Creación del store usando Zustand
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

  userLoginData: {
    displayName: "",
    email: "",
    photoURL: "",
  },
  setUserLoginDAta: (data) => set({ userLoginData: data }),

  isUserLogin: false,
  setIsUserLogin: (login) => set({ isUserLogin: login }),

  showAlert: false,
  alertMessage: "",
  alertSeverity: "success",

  isNodeViewActive: false,
  setIsNodeViewActive: (nodeView) => set({ isNodeViewActive: nodeView }),

  overlayDontShowAgain: false,
  setOverlayDontShowAgain: (dontShow) =>
    set({ overlayDontShowAgain: dontShow }),

  languageGlobal: "",
  setLanguageGlobal: (language) => set({ languageGlobal: language }),

  isConfigWindowActive: false,
  setIsconfigWindowActive: (configWindow) =>
    set({ isConfigWindowActive: configWindow }),

  nodeViewData: {
    videoid: "",
    start: "",
    end: ",",
  },
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

  activeStep: 0,
  setActiveStep: (step) => set({ activeStep: step }),
  // Incrementa el paso actual en 1
  nextStep: () => set((state) => ({ activeStep: state.activeStep + 1 })),
  // Decrementa el paso actual, sin permitir valores negativos
  prevStep: () =>
    set((state) => ({ activeStep: Math.max(0, state.activeStep - 1) })),

  // --- Estado de Validación por Pasos ---
  // Estado inicial de validación de los pasos
  stepValidation: {
    step0: false,
    step1: false,
    step2: false,
  },
  // Funciones de validación registradas para cada paso (inicialmente vacío)
  validateFns: {},
  // Registra una función de validación para un paso específico
  setValidateFn: (step, fn) =>
    set((state) => ({
      validateFns: {
        ...state.validateFns,
        [step]: fn,
      },
    })),
  // Ejecuta la función de validación para un paso y actualiza el estado
  // Retorna true si la validación es exitosa, false en caso contrario
  runValidation: async (step) => {
    const fn = get().validateFns[step];
    if (!fn) return false;
    const isValid = await fn();
    set((state) => ({
      stepValidation: {
        ...state.stepValidation,
        [step]: isValid,
      },
    }));
    return isValid;
  },
  // Ejecuta la validación de forma secuencial para una lista de pasos
  // Si algún paso falla, detiene la ejecución y retorna false
  runSequentialValidation: async (steps) => {
    for (const step of steps) {
      const isValid = await get().runValidation(step);
      if (!isValid) return false;
    }
    return true;
  },

  cameraBackup: null,
  setCameraBackup: (pos, target) => set({ cameraBackup: { pos, target } }),
  clearCameraBackup: () => set({ cameraBackup: null }),

  //  -------------------------- Estados de la UI ------------------------------------
  showFullGraph: true,
  setShowFullGraph: (show) => set({ showFullGraph: show }),
}));

export default useUIStore;
