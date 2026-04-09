export type VertexId = `x${number}`;
export type EdgeId = `${VertexId}->${VertexId}`;
export type AdjacencyMatrix = number[][];
export type FlowPoint = {
  x: number;
  y: number;
};

export type HistoryActionType = 'add-edge' | 'remove-edge' | 'toggle-matrix' | 'reconstruct';

export interface Vertex {
  id: VertexId;
  label: string;
  index: number;
}

export interface Edge {
  id: EdgeId;
  source: VertexId;
  target: VertexId;
}

export interface ComponentResult {
  id: string;
  vertexIds: VertexId[];
  edgeIds: EdgeId[];
  color: string;
}

export interface HistoryAction {
  type: HistoryActionType;
  edge?: Edge;
  rowIndex?: number;
  columnIndex?: number;
  nextValue?: 0 | 1;
  fromVertexCount?: number;
  toVertexCount?: number;
}

export interface HistoryState {
  past: HistoryAction[];
  future: HistoryAction[];
}

export interface GraphState {
  vertexCount: number;
  vertices: Vertex[];
  edges: Edge[];
  matrix: AdjacencyMatrix;
  selectedEdgeId: EdgeId | null;
  hoveredEdgeId: EdgeId | null;
  pendingEdgeSourceId: VertexId | null;
  componentResults: ComponentResult[];
  history: HistoryState;
}

export interface VertexCountControlState {
  draftValue: string;
  pendingValue: number | null;
  isConfirmOpen: boolean;
}

export interface SimpleGraph {
  vertices: VertexId[];
  adjacencyList: Record<VertexId, VertexId[]>;
  reverseAdjacencyList: Record<VertexId, VertexId[]>;
}
