// Configuración global de la aplicación
export const configGlobal = {
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
  // iconMenuBackgraundColor: "rgb(189, 189, 189)",
  // itemsMenuColor: "rgb(138, 137, 137)",
  // addNodoPanelColor: "rgb(255, 255, 255)",
  // shadowGeneral: "drop-shadow(0px 2px 8px rgba(255, 255, 255, 0.75))",
};

// Colores asignados a los grupos de nodos
export const groupColor: Record<string, string> = {
  genesis: "rgb(255, 255, 255)", 
  submission:"rgb(255, 0, 0)51)", 
  pass: "rgb(27, 250, 250)", 
  switch: "rgb(255, 243, 17)", 
  transition: "rgb(198, 122, 28)", 
  control: "rgb(22, 123, 230)", 
  tachi_waza: "rgb(125, 132, 255)", 
  defence: "rgb(0, 255, 0)",
  guard: "rgb(234, 4, 255)",
};

export const cameraPropsDev = {
  fov: 90, // Ángulo de visión en grados (por defecto, el ángulo vertical) que define cuán amplia es la perspectiva de la cámara. 
  near: 0.1, // Distancia mínima desde la cámara a la que se renderizan los objetos.
  far: 1000, // Distancia máxima desde la cámara a la que se renderizan los objetos.
  position: [30, 50, 100] as [number, number, number], // Posición de la cámara en el espacio 3D, definida como un arreglo con tres valores [𝑥,𝑦,𝑧]

  dollySpeed: 4,    // Sensibilidad del zoom
  minDistance: 20,    // Distancia mínima para la cámara 
  maxDistance: 270,   // Distancia máxima para la cámara 
};

export const scenePropsDev = {
  radius: 180, // Radio del fondo estrellado
  depth: 5, // Profundidad del fondo estrellado
  count: 2000, // Número de estrellas
  factor: 7, // Factor de dispersión de las estrellas
  saturation: 1, // Saturación del color de las estrellas
  speed: 0.5, // Velocidad del movimiento de las estrellas
};

export const tableNameDB = {
  nodes: "nodos",
  links: "links",
}

