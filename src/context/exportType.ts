import { GraphMethods } from "r3f-forcegraph";

type GraphRefType =
  | GraphMethods<{ id: number }, { source: number; target: number }>
  | undefined;

type NodeFormData = {
  /**
  * Se definen los datos que recogera el formulario
  */
  index: number;
  name: string;
  position: string;
  nodeSourceIndex: number;
  // useGi?: string;
  // description?: string;
  // linkVideo?: string;
  // autor?: string;
  // uploadedBy?: string;
  uploadedDate?: string;
};

type NodeOptionFirestone = {
  id?: number;
  index?: number;
  name?: string;
  position?: string;
};

type GraphNode = {
  id?: number;
  x?: number;
  y?: number;
  z?: number;
  name?: string;
  position?: string;
  color?: string;
  group?: string;
};

type GraphLink = {
  source: number;
  target: number;
};

type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

export type { GraphNode, GraphRefType, NodeFormData, NodeOptionFirestone, GraphLink, GraphData };
