import { GraphMethods } from "r3f-forcegraph";

type GraphRefType =
  | GraphMethods<{ id: number }, { source: number; target: number }>
  | undefined;

type NodeFormData = {
  index: number;
  name: string;
  position: string;
  nodeSource: number;
  // useGi?: string;
  // description?: string;
  // linkVideo?: string;
  // autor?: string;
  // uploadedBy?: string;
  uploadedDate?: string;
};

type NodeOptionFirestone = {
  id: string;
  index: number;
  name: string;
  position: string;
};

type GraphNode =   {
  id: number;
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

export type { GraphNode, GraphRefType, NodeFormData, NodeOptionFirestone, GraphLink};
