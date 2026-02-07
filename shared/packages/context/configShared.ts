export const projectName = "BLACK TRIANGLE";

export const testSystems = [
  { title: "DogFight" },
  { title: "Control Lateral" },
  { title: "Retencion Media Guardia" },
  { title: "Back Escapes" },
  { title: "Mount Escapes" },
];
export const testRoutes = [
  { title: "Escapes Básicos", level: "Nivel · Principiante", lessons: 4 },
  { title: "Ataques Básicos", level: "Nivel · Principiante", lessons: 7 },
  { title: "Control Lateral", level: "Nivel · Intermedio", lessons: 6 },
  { title: "Tomas de Espalda", level: "Nivel · Intermedio", lessons: 5 },
];

// **** isLogin sera movido a contexto global ****
export const isLogin = true;
export const userIniciales = "YY"
export const userName = "Jeison Rosario"

export const coverUrlDefault = "https://picsum.photos/1500/800"

/**
 * Tabla de rutas y colecciones principales utilizadas en Firestore.
 * Contiene referencias tanto a los sistemas almacenados como a los índices globales.
 */
export const tableNameDB = {
    categories: "taxonomy", // nombre de la coleccion de categorias principales
    subCategory: "subCategories", // nombre de la collecion de las subcoleeciones de group
    indexGlobal: "index_global", // nombre de la collecion que marca el index  global
    indexGlobalID: "63keMnlfnUPYdIxLUviv", // identificador unico del documento de index global
    nodeTaxonomy: "node_taxonomy", // nombre de la coleccion intermedia entre los nodos y los tabs
    tab_ids: "tab_ids", // nombre del registro de los tab dentro de la coleccion de node_taxonomy
    tabs: "tabs", // nombre de la coleccion de las etiquetas
    systemsCollections: "systems"
};

