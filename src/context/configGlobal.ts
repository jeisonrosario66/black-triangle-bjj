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
    namePage: "BLACK \n TRIANGLE BJJ"
};

/**
 * Paleta de colores asociada a los tipos de nodos del sistema BJJ.
 * Cada tipo tiene un color específico para facilitar su identificación visual.
 */
export const groupColor: Record<string,
    string> = {
    system: "rgb(159, 159, 159)",
    submission: "rgb(200, 0, 0)",
    pass: "rgb(0 , 128, 128)",
    switch: "rgb(255, 215, 0)", transition: "rgb(128, 0, 128)", control: "rgb(0, 102, 204)", takedown: "rgb(255, 140, 0)", defence: "rgb(34, 139, 34)", guard: "rgb(139, 69, 19)", defense_escape: "rgba(255, 185, 135, 1)"
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
    maxDistance: 1000
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
    speed: 0.5
};

/**
 * Claves y configuraciones relacionadas con la persistencia de preferencias del usuario.
 * Incluye idioma, configuración de grafo y sistemas cargados en caché.
 */
export const cacheUser = {
    languageUser: "languageApp",
    languageDefault: localStorage.getItem("languageApp") || "es",
    navigationsGestures: "hideNavigationGestures",

    dagModeCache: "dagMode",
    dagMode: (localStorage.getItem("dagMode") as DagMode) || ("td" as DagMode),

    dagLevelDistanceCache: "dagLevelDistance",
    dagLevelDistance: localStorage.getItem("dagLevelDistance") || 5,

    systemsCacheNameNodes: "systemsCacheNodes",
    systemsCacheNameLinks: "systemsCacheLinks",

    systemsNodesLoaded: [],
    systemsLinksLoaded: []
};
/**
 * Rutas activas de nodos y enlaces para la sesión actual.
 * Estas rutas determinan el contenido del grafo que se cargará.
 */
const systemCacheLoadedLinks = parseCacheArray(cacheUser.systemsCacheNameLinks);
const systemCacheLoadedNodes = parseCacheArray(cacheUser.systemsCacheNameNodes);

/**
 * Tabla de rutas y colecciones principales utilizadas en Firestore.
 * Contiene referencias tanto a los sistemas almacenados como a los índices globales.
 */
export const tableNameDB = {
    AllSystemsNodesArray: systemCacheLoadedNodes,
    AllSystemsLinksArray: systemCacheLoadedLinks,
    categories: "taxonomy", // nombre de la coleccion de categorias principales
    subCategory: "subCategories", // nombre de la collecion de las subcoleeciones de group
    indexGlobal: "index_global", // nombre de la collecion que marca el index  global
    indexGlobalID: "63keMnlfnUPYdIxLUviv", // identificador unico del documento de index global
    nodeTaxonomy: "node_taxonomy", // nombre de la coleccion intermedia entre los nodos y los tabs
    tab_ids: "tab_ids", // nombre del registro de los tab dentro de la coleccion de node_taxonomy
    tabs: "tabs", // nombre de la coleccion de las etiquetas
    systemsCollections: "systems"
};

/**
 * Rutas principales de navegación interna de la aplicación.
 * Define las direcciones utilizadas por el enrutador para acceder a las vistas.
 */
export const routeList = {
    root: "/",
    loginUser: "/login_user",
    profile: "/profile"
};
