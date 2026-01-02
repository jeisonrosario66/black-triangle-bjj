import {GraphMethods} from "r3f-forcegraph";

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
type NodeNames = {
    name_es: string;
    name_en: string;
};
type MultilangDescription = {
    descrip_es?: StructuredDescription;
    descrip_en?: StructuredDescription;
};
/**
 * Referencia al grafo 3D, basada en los métodos expuestos por r3f-forcegraph.
 */
export type GraphRefType = |GraphMethods < GraphNode,
GraphLink > | undefined;
/**
 * Datos necesarios para insertar un nuevo nodo en la base de datos.
 *
 * Este tipo representa el **payload normalizado de creación**, utilizado
 * exclusivamente en operaciones de escritura (insert) hacia Firestore.
 *
 * Consideraciones clave:
 * - Este tipo **no representa un nodo del grafo ni de la UI**, sino un modelo
 *   de persistencia orientado a base de datos.
 * - `idNewNode` define la posición ordinal del nodo dentro del sistema y no su identidad.
 * - La identidad global del nodo se genera o asigna en la capa de persistencia.
 * - `nodeSource` indica uno o varios nodos existentes desde los cuales se crea
 *   el enlace inicial (relación dirigida).
 * - Los campos `descrip_es` y `descrip_en` permiten almacenar descripciones
 *   estructuradas y multilenguaje, siendo opcionales según el contenido disponible.
 *
 * Este tipo debe mantenerse aislado de los modelos de visualización y simulación.
 */

export type NodeInsertData = {
    dbNodesName: string;
    dbLinksName: string;
    idNewNode: number;
    group: string;
    videoid: string;
    nodeSource: number | number[];
    uploadedDate: string;
} & NodeNames & MultilangDescription;
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
export type OptionTechniqueCard =  {
    label: string;
    name?: string;
    group?: string;
    value: string;
    icon?: React.ReactNode;
};


/**
 * Información asociada al nodo actualmente seleccionado (vista de detalle).
 */
export type NodeViewData = CoreNode

/**
 * Modos de disposición jerárquica (DAG) soportados por r3f-forcegraph.
 */
export type DagMode = |"td" // Top → Down
| "bu" // Bottom → Up
| "lr" // Left → Right
| "rl" // Right → Left
| "zout" // Profundidad hacia afuera (obsoleto en algunas versiones)
| "zin" // Profundidad hacia adentro (obsoleto)
| "radialout" // Radial desde el centro hacia afuera
| "radialin"; // Radial desde afuera hacia el centro
