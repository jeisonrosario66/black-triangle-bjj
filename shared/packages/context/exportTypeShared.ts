type NodeIdentity = {
  id: number;
  index?: number;
};
type NodePosition3D = {
  x: number;
  y: number;
  z: number;
};
type StructuredDescription = {
  summary: string;
  points: string[];
};
type NodeMetadata = {
  name: string;
  group: string;
  videoid: string;
  color?: string;
  description: StructuredDescription;
};
type CoreNode = NodeIdentity & NodeMetadata;

/**
 * Representación de un nodo almacenado en Firestore.
 *
 * Notas importantes sobre identificadores:
 * - `id` es el identificador único y permanente del nodo en todo el sistema.
 *   Se utiliza para persistencia, referencias y relaciones entre nodos.
 * - `index` representa la posición ordinal del nodo dentro de un sistema o conjunto específico.
 *   Puede cambiar si el sistema se reorganiza y no debe usarse como identificador único.
 *
 * Ambos valores cumplen propósitos distintos y no son intercambiables.
 */
export type NodeOptionFirestore = CoreNode;

/**
 * Definición de grupo o categoría cargada desde Firestore.
 */
export type GroupOptionFirestore = {
  label: string;
  title: string;
  description: string;
};

/**
 * Representación de un nodo dentro del grafo visual.
 */
export type GraphNode = CoreNode & NodePosition3D;

/**
 * Enlace entre dos nodos del grafo (dirigido).
 */
export type GraphLink = {
  source: number;
  target: number;
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
  label: string;
  name?: string;
  group?: string;
  value: string;
  icon?: React.ReactNode;
};

/**
 * Información asociada al nodo actualmente seleccionado (vista de detalle).
 */
export type NodeViewData = CoreNode;

/**
 * Modos de disposición jerárquica (DAG) soportados por r3f-forcegraph.
 *
 * Definen la dirección y forma en que se organizan los nodos
 * dentro del grafo tridimensional.
 */
export type DagMode =
  | "td" // Top → Down (de arriba hacia abajo)
  | "bu" // Bottom → Up (de abajo hacia arriba)
  | "lr" // Left → Right (de izquierda a derecha)
  | "rl" // Right → Left (de derecha a izquierda)
  | "zout" // Profundidad hacia afuera (obsoleto en algunas versiones)
  | "zin" // Profundidad hacia adentro (obsoleto)
  | "radialout" // Radial desde el centro hacia afuera
  | "radialin"; // Radial desde afuera hacia el centro

/**
 * Configuración de idioma de la aplicación.
 * Define el locale activo para internacionalización.
 */
export type LanguageConfig = {
  locale: "es" | "en";
};

/**
 * Opción de sistema seleccionable.
 * Asocia identificadores de nodos y enlaces con una etiqueta descriptiva.
 */
export type SystemCardOption = {
  coverUrl: string;
  valueNodes: string;
  valueLinks: string;
  label: string;
  set: string;
  instructor: string;
  description: string;
};

export type HeaderAction =
  | { type: "search" }
  | { type: "avatar"; initials?: string }
  | { type: "notifications"; unread?: number }
  | { type: "divider" }
  | { type: "explorer" };

export type SystemCardUI = SystemCardOption & {
  setSystem: string;
  coverUrl: string;
};


export type Tag = {
  id: string;
  label: string;
  title_es?: string;
  title_en?: string;
}

export type  NodeTaxonomy = {
  id?: string,
  category_id: string;
  subcategory_id: string;
  specific_category_id: string;
  tab_ids: string[];
  node_index: number;
}