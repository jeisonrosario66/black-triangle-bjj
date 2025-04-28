import { GraphMethods } from "r3f-forcegraph";

export type GraphRefType =
  | GraphMethods<{ id?: number }, { source: number; target: number }>
  | undefined;

export type NodeFormData = {
  /**
   * Se definen los datos que recogera el formulario
   */
  index: number;
  name: string;
  group: string;
  nodeSourceIndex: number;
  uploadedDate?: string;
  videoid?: string;
  end?: string;
  start?: string;
};

export type NodeOptionFirestone = {
  id?: number | string;
  index?: number;
  name?: string;
  group?: string;
  start?: string;
  end?: string;
  videoid?: string;
};

export type GraphNode = {
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

export type GraphLink = {
  source: number;
  target: number;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

export type OptionTechniqueCard = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  id?: number | string;
  name?: string;
  group?: string;
}

export type PlayerControlsData = {
  start?: string;
  end?: string;
  videoid?: string;
}