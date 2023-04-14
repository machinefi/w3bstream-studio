export interface FlowData {
  edges: Edge[];
  nodes: FlowNode[];
}

export interface FlowNode {
  id: string;
  data: Record<string, any>;
  type: string;
  position: Position;
  executor?: Function;
  input?: any;
  output?: any;
}

export interface Position {
  x: number;
  y: number;
}

export interface Edge {
  source: string;
  target: string;
}
