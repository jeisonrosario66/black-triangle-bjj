import { GraphMethods } from "r3f-forcegraph";

/**
 * Referencia al grafo 3D, basada en los métodos expuestos por r3f-forcegraph.
 */
export type GraphRefType =
  | GraphMethods<{ id?: number }, { source: number; target: number }>
  | undefined;

/**
 * Datos recogidos desde el formulario de creación de nodo.
 */
export type NodeFormData = {
  index: number;
  name: string;
  group: string;
  nodeSourceIndex: number;
  uploadedDate?: string;
  videoid?: string;
  end?: string;
  start?: string;
};

/**
 * Datos necesarios para insertar un nuevo nodo en la base de datos.
 */
export type NodeInsertData = {
  dbNodesName: string; // Nombre de la colección de nodos
  dbLinksName: string; // Nombre de la colección de enlaces
  index: number;
  name_es: string;
  name_en: string;
  group: string;
  nodeSource: number; // ID del nodo origen (para crear el enlace)
  videoid: string;
  start: string;
  end: string;
  uploadedDate: string;
  descrip_es?: { summary: string; points: string[] };
  descrip_en?: { summary: string; points: string[] };
};

/**
 * Representación de un nodo almacenado en Firestore.
 */
export type NodeOptionFirestone = {
  id?: number | string;
  index?: number;
  name?: string;
  group?: string;
  start?: string;
  end?: string;
  videoid?: string;
  x?: string; // Posición X en el grafo (si está definida)
  y?: string; // Posición Y
  z?: string; // Posición Z
};

/**
 * Definición de grupo o categoría cargada desde Firestore.
 */
export type GroupOptionFirestone = {
  label: string;
  title: string;
  description: string;
};

/**
 * Representación de un nodo dentro del grafo visual.
 */
export type GraphNode = {
  id?: number;
  x?: number;
  y?: number;
  z?: number;
  name?: string;
  color?: string;
  group?: string;
  subGroup?: string;
  start?: string;
  end?: string;
  videoid?: string;
  description?: { summary: string; points: string[] };
};

/**
 * Enlace entre dos nodos del grafo (dirigido).
 */
export type GraphLink = {
  source: number | GraphNode;
  target: number | GraphNode;
};

/**
 * Conjunto completo de nodos y enlaces para renderizar el grafo.
 */
export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

/**
 * Opción para tarjetas de selección de técnicas (por ejemplo, en formularios o menús).
 */
export type OptionTechniqueCard = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  id?: number | string;
  name?: string;
  group?: string;
};

/**
 * Datos enviados desde los controles de reproducción de video (inicio y fin de un fragmento).
 */
export type PlayerControlsData = {
  start?: string;
  end?: string;
  videoid?: string;
};

/**
 * Información asociada al nodo actualmente seleccionado (vista de detalle).
 */
export type NodeViewData = {
  videoid?: string;
  start?: string;
  end?: string;
  name?: string;
  color?: string;
  group?: string;
  id?: number;
  description?: { summary: string; points: string[] };
};

/**
 * Modos de disposición jerárquica (DAG) soportados por r3f-forcegraph.
 */
export type DagMode =
  | "td" // Top → Down
  | "bu" // Bottom → Up
  | "lr" // Left → Right
  | "rl" // Right → Left
  | "zout" // Profundidad hacia afuera (obsoleto en algunas versiones)
  | "zin" // Profundidad hacia adentro (obsoleto)
  | "radialout" // Radial desde el centro hacia afuera
  | "radialin"; // Radial desde afuera hacia el centro

/**
 * Categoría de técnicas grupos de técnicas de BJJ
 */
export type Category = {
  label: string;
  title?: string;
  title_en: string;
  title_es: string;
  description?: string;
  description_en: string;
  description_es: string;
  categoryId: string;
};

/**
 * Subcategoría de técnicas grupos de técnicas de BJJ
 */
export type Subcategory = {
  label: string;
  title?: string;
  title_en: string;
  title_es: string;
  description?: string;
  description_en: string;
  description_es: string;
  categoryId: string;
  groupId: string;
};

export type TaxonomyType = {
  category_id: string;
  node_index: number;
  specific_category_id: string;
  subcategory_id: string;
  tab_ids: string[];
};
