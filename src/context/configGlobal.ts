// Configuración global de la aplicación
const configGlobal = {
  canvasBackgraundColor: "#002", // Color de fondo del lienzo
  // spriteBackgroundColor: "#002", // Color de fondo de los sprites
  // linksColor: "rgb(173, 167, 167)", // Color de los enlaces
  // linksColorResaldato: "rgb(245, 229, 183)", // Color de los enlaces
  // particleColor: "rgb(235, 243, 124)", // Color de las partículas
  // arrowsColor: "rgb(88, 88, 88)", // Color de las flechas
  // panelColor: "rgb(177, 177, 177)", // Color del panel de información
  // cameraPosition: [200, 0, 0] as [number, number, number], // Posición inicial de la cámara
  // cameraMaxDistance: 800, // Distancia máxima de la cámara
  // cameraMinDistance: 10, // Distancia mínima de la cámara
  // nodeClickDistance: 70, // Distancia al nodo despues del click
  // linkClickDistance: 100, // Distancia al link despues del click
  DataBaseDir: "datasets/data.json", // Directorio de la base de datos
  // iconMenuBackgraundColor: "rgb(189, 189, 189)",
  // itemsMenuColor: "rgb(138, 137, 137)",
  // addNodoPanelColor: "rgb(255, 255, 255)",
  // shadowGeneral: "drop-shadow(0px 2px 8px rgba(255, 255, 255, 0.75))",
};

// Colores asignados a los grupos de nodos
const positionColor: Record<string, string> = {
  control: "rgb(0, 0, 255)", // Azul
  sumision: "rgb(0, 255, 51)", // Rojo
  pasaje: "rgb(27, 250, 250)", // Amarillo
};

const cameraPropsDev = {
  fov: 70, // Ángulo de visión en grados (por defecto, el ángulo vertical) que define cuán amplia es la perspectiva de la cámara. 
  near: 0.1, // Distancia mínima desde la cámara a la que se renderizan los objetos.
  far: 1000, // Distancia máxima desde la cámara a la que se renderizan los objetos.
  position: [30, 50, 100] as [number, number, number], // Posición de la cámara en el espacio 3D, definida como un arreglo con tres valores [𝑥,𝑦,𝑧]

  dollySpeed: 5,    // Sensibilidad del zoom
  minDistance: 20,    // Distancia mínima para la cámara 
  maxDistance: 170,   // Distancia máxima para la cámara 
};

const scenePropsDev = {
  radius: 80, // Radio del fondo estrellado
  depth: 5, // Profundidad del fondo estrellado
  count: 2000, // Número de estrellas
  factor: 7, // Factor de dispersión de las estrellas
  saturation: 1, // Saturación del color de las estrellas
  speed: 0.5, // Velocidad del movimiento de las estrellas
};

const tableNameDB = {
  nodes: "nodos",
  links: "links",
}


export { configGlobal, cameraPropsDev, scenePropsDev, tableNameDB, positionColor };




















































// /**
//    * Definición de tipo para los enlaces
//    * @typedef {Object} LinkType
//    * @property {string} source - Nodo fuente del enlace
//    * @property {string} target - Nodo destino del enlace
//    * @property {boolean} isBidirectional - Indica si el enlace es bidireccional
//    */
// interface LinkType {
//   source: string;
//   target: string;
//   isBidirectional: boolean;
// }



// /**
//  * @typedef {Object} GraphLink
//  * @property {number} id - Identificador del enlace
//  * @property {number} x - Posición en el eje x
//  * @property {number} y - Posición en el eje y
//  * @property {number} z - Posición en el eje z
//  * @property {string} name - Nombre del enlace
//  * @property {number} source - Nodo fuente del enlace
//  * @property {number} target - Nodo destino del enlace
//  * @property {string} group - Grupo al que pertenece el enlace
//  * @property {boolean} isBidirectional - Indica si el enlace está invertido
//  * @property {number} curvature - Curvatura del enlace
//  */
// type GraphLink = {
//   id: number;
//   x?: number;
//   y?: number;
//   z?: number;
//   name: string;
//   source: number;
//   target: number;
//   group?: string;
//   isBidirectional?: boolean;
//   curvature?: number
//   start: number,
//   end: number
// };

// /**
//  * @typedef {Object} GraphNode
//  * @property {number} id - Identificador del nodo
//  * @property {number} x - Posición en el eje x
//  * @property {number} y - Posición en el eje y
//  * @property {number} z - Posición en el eje z
//  * @property {string} name - Nombre del nodo
//  * @property {string} color - Color del nodo
//  * @property {string} group - Grupo al que pertenece el nodo
//  * @property {string} type - Tipo de nodo
//  */
// type GraphNode = {
//   id: number;
//   x?: number;
//   y?: number;
//   z?: number;
//   name?: string;
//   color?: string;
//   group?: string;
// };


// export { configGlobal, groupColors, NodeType, LinkType, GraphLink, GraphNode }; 