// Configuración global de la aplicación
export const configGlobal = {
  canvasBackgraundColor: "#002", // Color de fondo del lienzo
  intensity: 0.7, // Intensidad de la luz ambiental
  colorLight: "#fff", // Color de la luz
  position: [100, 20, 10] as [number, number, number], // Posición de la luz direccional
};

// Colores asignados a los grupos de nodos
export const groupColor: Record<string, string> = {
  genesis: "rgb(255, 255, 255)",
  submission: "rgb(255, 0, 0)",
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

  dollySpeed: 4, // Sensibilidad del zoom
  minDistance: 20, // Distancia mínima para la cámara
  maxDistance: 270, // Distancia máxima para la cámara
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
};
