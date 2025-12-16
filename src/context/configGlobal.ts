import { DagMode } from "@src/context/index";
import { parseCacheArray } from "@src/utils/index";

/**
 * Configuración general del entorno visual 3D y parámetros de la aplicación.
 * Define colores, iluminación, posición de la cámara y nombre de la aplicación.
 */
export const configGlobal = {
  canvasBackgraundColor: "#002",
  intensity: 0.7,
  colorLight: "#fff",
  position: [100, 20, 10] as [number, number, number],
  logoApp: "./logoApp.svg",
  namePage: "BLACK \n TRIANGLE BJJ",
};

/**
 * Paleta de colores asociada a los tipos de nodos del sistema BJJ.
 * Cada tipo tiene un color específico para facilitar su identificación visual.
 */
export const groupColor: Record<string, string> = {
  system: "rgb(159, 159, 159)",
  submission: "rgb(200, 0, 0)",
  pass: "rgb(0 , 128, 128)",
  switch: "rgb(255, 215, 0)",
  transition: "rgb(128, 0, 128)",
  control: "rgb(0, 102, 204)",
  takedown: "rgb(255, 140, 0)",
  defence: "rgb(34, 139, 34)",
  guard: "rgb(139, 69, 19)",
};

/**
 * Propiedades de la cámara utilizadas en modo de desarrollo.
 * Permiten un control flexible para depuración de la escena 3D.
 */
export const cameraPropsDev = {
  fov: 80,
  near: 0.1,
  far: 1000,
  position: [251, -93, -18] as [number, number, number],
  dollySpeed: 4,
  minDistance: 20,
  maxDistance: 2700,
};

/**
 * Configuración del entorno estrellado utilizado como fondo visual.
 * Controla el número, tamaño y movimiento de los elementos del fondo.
 */
export const scenePropsDev = {
  radius: 180,
  depth: 5,
  count: 2000,
  factor: 7,
  saturation: 1,
  speed: 0.5,
};

/**
 * Rutas a las colecciones de sistemas BJJ almacenadas en Firestore.
 * Contienen las definiciones de nodos y enlaces por sistema.
 */
const SystemsOfBjjNodes = ["/systems/headlock/nodes", "/systems/test/nodes"];
const SystemsOfBjjLinks = ["/systems/headlock/links", "/systems/test/links"];

/**
 * Lista de sistemas disponibles para carga y visualización en la aplicación.
 * Cada entrada asocia los nodos, enlaces y una etiqueta descriptiva.
 */
export const systemsOptions = [
  {
    valueNodes: "/systems/test/nodes",
    valueLinks: "/systems/test/links",
    label: "Test",
  },
  {
    valueNodes: "/systems/headlock/nodes",
    valueLinks: "/systems/headlock/links",
    label: "HeadLock",
  },
  {
    valueNodes: "/systems/dogfight/nodes",
    valueLinks: "/systems/dogfight/links",
    label: "DogFight",
  },
];

/**
 * Claves y configuraciones relacionadas con la persistencia de preferencias del usuario.
 * Incluye idioma, configuración de grafo y sistemas cargados en caché.
 */
export const cacheUser = {
  languageDefault: "es",
  languageUser: "languageApp",
  navigationsGestures: "hideNavigationGestures",

  dagModeCache: "dagMode",
  dagMode: (localStorage.getItem("dagMode") as DagMode) || ("rl" as DagMode),

  dagLevelDistanceCache: "dagLevelDistance",
  dagLevelDistance: localStorage.getItem("dagLevelDistance") || 35,

  systemsCacheNameNodes: "systemsCacheNodes",
  systemsCacheNameLinks: "systemsCacheLinks",

  systemsNodesLoaded: [],
  systemsLinksLoaded: [],
};

/**
 * Rutas activas de nodos y enlaces para la sesión actual.
 * Estas rutas determinan el contenido del grafo que se cargará.
 */
export const nodes = SystemsOfBjjNodes[1];
export const links = SystemsOfBjjLinks[1];
const systemCacheLoadedLinks = parseCacheArray(cacheUser.systemsCacheNameLinks);
const systemCacheLoadedNodes = parseCacheArray(cacheUser.systemsCacheNameNodes);

/**
 * Mapa centralizado de colecciones, documentos e índices utilizados en Firestore.
 * Define las fuentes de datos principales del sistema, incluyendo nodos, taxonomía,
 * relaciones y estructuras de indexación global.
 */
export const firestoreSchema = {
  /** Cache en memoria de todos los nodos cargados por sistema */
  cachedSystemNodes: systemCacheLoadedNodes,
  /** Cache en memoria de todos los enlaces cargados por sistema */
  cachedSystemLinks: systemCacheLoadedLinks,
  /** Colección principal de nodos técnicos */
  nodes,
  /** Colección principal de relaciones entre nodos */
  links,
  /** Colección raíz de la taxonomía (categorías principales) */
  categories: "taxonomy",
  /** Colección de subcategorías asociadas a una categoría principal */
  subcategories: "subCategories",
  /** Colección que mantiene el índice global incremental del sistema */
  globalIndexCollection: "index_global",
  /** ID único del documento que almacena el índice global */
  globalIndexDocId: "63keMnlfnUPYdIxLUviv",
  /** Colección puente entre nodos y etiquetas taxonómicas */
  nodeTaxonomy: "node_taxonomy",
  /** Campo que almacena los identificadores de tabs asociados a un nodo */
  nodeTabIdsField: "tab_ids",
  /** Colección de etiquetas (tabs) utilizadas para clasificación y filtrado */
  tabs: "tabs",
};
/**
 * Rutas principales de navegación interna de la aplicación.
 * Define las direcciones utilizadas por el enrutador para acceder a las vistas.
 */
export const routeList = {
  root: "/",
  categories: "/categories",
  addNode: "/add_node",
  loginUser: "/login_user",
  profile: "/profile",
  test: "test_add_fast",
};
