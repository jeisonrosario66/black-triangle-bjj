import { GraphMethods } from "r3f-forcegraph";

/**
* Definición de tipo para los nodos
 */
interface NodeType {
    id: number;
    // name: string;
    // source: number;
    // target: number;
    // group: string;
    // url: string,
    // start: number,
    // end: number
  }
  
  
  type GraphNode = {
      id: number;
      x?: number;
      y?: number;
      z?: number;
      nombre?: string;
      posicion?: string;
      color?: string;
      group?: string;
  };

  // 🔥 Definimos el tipo de referencia para el grafo
  type GraphRefType =
    | GraphMethods<{ id: number }, { source: number; target: number }>
    | undefined;
  
  
export type { GraphNode, NodeType, GraphRefType };