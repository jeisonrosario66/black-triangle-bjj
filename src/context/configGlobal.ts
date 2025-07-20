import { DagMode } from "@src/context/index";
import { string } from "yup";

// Configuración visual global para el lienzo y la escena 3D
export const configGlobal = {
  canvasBackgraundColor: "#002", // Color de fondo del canvas 3D
  intensity: 0.7, // Intensidad de la luz ambiental
  colorLight: "#fff", // Color de la luz direccional
  position: [100, 20, 10] as [number, number, number], // Posición de la luz en el espacio
};

// Colores asociados a cada tipo de grupo de nodo en el grafo
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

// Propiedades de la cámara para entorno de desarrollo (posición y límites)
export const cameraPropsDev = {
  fov: 80, // Ángulo de visión vertical (field of view)
  near: 0.1, // Distancia mínima de renderizado
  far: 1000, // Distancia máxima de renderizado
  position: [251, -93, -18] as [number, number, number], // Posición inicial de la cámara

  dollySpeed: 4, // Velocidad del zoom (dolly)
  minDistance: 20, // Límite mínimo de distancia de la cámara
  maxDistance: 270, // Límite máximo de distancia de la cámara
};

// Configuración del fondo estrellado para la escena (usado como decoración visual)
export const scenePropsDev = {
  radius: 180, // Radio del efecto estrellado
  depth: 5, // Profundidad del campo de estrellas
  count: 2000, // Número de estrellas
  factor: 7, // Dispersión de las estrellas en el espacio
  saturation: 1, // Saturación del color
  speed: 0.5, // Velocidad de movimiento del fondo
};

// Nombres de las colecciones utilizadas en la base de datos (Firestore)
const SystemsOfBjjNodes = ["headlock nodes", "test nodes", "submissions_from_the_Back nodes"];
const SystemsOfBjjLinks = ["headlock links", "test links", "submissions_from_the_Back links"];

const selectedNodes = SystemsOfBjjNodes.slice(2, 3);
const selectedLinks= SystemsOfBjjLinks.slice(2, 3);

export const nodes = SystemsOfBjjNodes[2]; // Colección de nodos activa
export const links = SystemsOfBjjLinks[2]; // Colección de enlaces entre nodos activa

export const tableNameDB = {
  nodesArray: selectedNodes,
  linksArray: selectedLinks,
  nodes,
  links,
  group: "taxonomy", // Colección de grupos o categorías
  subGroup: "subTaxonomy", // Colección de subgrupos
  indexGlobal: "indexGlobal",
  indexGlobalID: "9rII6qZvvc9ppKLcny3k"
};

// Valores almacenados en caché local por usuario (idioma, preferencias de visualización)
export const cacheUser = {
  languageDefault: "es", // Idioma predeterminado de la app
  languageUser: "languageApp", // Clave del idioma almacenado en localStorage
  navigationsGestures: "hideNavigationGestures", // Clave para ocultar gestos de navegación

  dagModeCache: "dagMode", // Clave del modo DAG guardado en caché
  dagMode: (localStorage.getItem("dagMode") as DagMode) || ("rl" as DagMode), // Modo DAG actual o valor por defecto

  dagLevelDistanceCache: "dagLevelDistance", // Clave para la separación de niveles
  dagLevelDistance: localStorage.getItem("dagLevelDistance") || 35, // Valor de separación por defecto o cacheado
};
