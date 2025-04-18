import { GraphMethods } from "r3f-forcegraph";

type GraphRefType =
  | GraphMethods<{ id?: number }, { source: number; target: number }>
  | undefined;

type NodeFormData = {
  /**
  * Se definen los datos que recogera el formulario
  */
  index: number;
  name: string;
  group: string;
  nodeSourceIndex: number;
  // useGi?: string;
  // description?: string;
  // linkVideo?: string;
  // autor?: string;
  // uploadedBy?: string;
  uploadedDate?: string;
};

type NodeOptionFirestone = {
  id?: number | string;
  index?: number;
  name?: string;
  group?: string;
  start?: string;
  end?: string;
  videoid?: string;
  
};

type GraphNode = {
  id?: number;
  x?: number;
  y?: number;
  z?: number;
  name?: string;
  color?: string;
  group?: string;
  start?: string;
  end?: string;
  videoid?: string;
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
