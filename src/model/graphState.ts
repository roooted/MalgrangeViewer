import type { Edge, GraphState, HistoryAction, HistoryState, Vertex, VertexCountControlState } from './types';
import {
  createEdgeFromIndexes,
  createMatrixFromEdges,
  createVertexId,
  createZeroMatrix,
  findEdgeByIndexes,
  removeEdgeByIndexes,
  toggleMatrixValue,
} from '../utils/matrixMapping';

export const MIN_VERTEX_COUNT = 2;
export const MAX_VERTEX_COUNT = 20;
export const DEFAULT_VERTEX_COUNT = 8;

const createEmptyHistoryState = (): HistoryState => ({
  past: [],
  future: [],
});

export const clampVertexCount = (value: number): number =>
  Math.min(MAX_VERTEX_COUNT, Math.max(MIN_VERTEX_COUNT, value));

export const createVertices = (vertexCount: number): Vertex[] =>
  Array.from({ length: vertexCount }, (_, index) => {
    const id = createVertexId(index);

    return {
      id,
      label: id,
      index,
    };
  });

export const createEmptyGraphState = (vertexCount = DEFAULT_VERTEX_COUNT): GraphState => {
  const normalizedVertexCount = clampVertexCount(vertexCount);

  return {
    vertexCount: normalizedVertexCount,
    vertices: createVertices(normalizedVertexCount),
    edges: [],
    matrix: createZeroMatrix(normalizedVertexCount),
    selectedEdgeId: null,
    hoveredEdgeId: null,
    pendingEdgeSourceId: null,
    componentResults: [],
    history: createEmptyHistoryState(),
  };
};

// При реконструкции полностью пересобираем изолированные вершины, пустые дуги и пустую историю.
export const reconstructGraphState = (vertexCount: number): GraphState =>
  createEmptyGraphState(vertexCount);

const appendHistoryAction = (history: HistoryState, action: HistoryAction): HistoryState => ({
  past: [...history.past, action],
  future: [],
});

export const applyMatrixToggle = (
  graphState: GraphState,
  rowIndex: number,
  columnIndex: number,
): GraphState => {
  const nextMatrix = toggleMatrixValue(graphState.matrix, rowIndex, columnIndex);
  const nextValue = ((nextMatrix[rowIndex]?.[columnIndex] ?? 0) === 1 ? 1 : 0) as 0 | 1;
  const currentEdge = findEdgeByIndexes(graphState.edges, graphState.vertices, rowIndex, columnIndex);

  let nextEdges: Edge[];

  if (nextValue === 1) {
    nextEdges = currentEdge
      ? graphState.edges
      : [...graphState.edges, createEdgeFromIndexes(graphState.vertices, rowIndex, columnIndex)];
  } else {
    nextEdges = removeEdgeByIndexes(graphState.edges, graphState.vertices, rowIndex, columnIndex);
  }

  return {
    ...graphState,
    edges: nextEdges,
    matrix: createMatrixFromEdges(graphState.vertexCount, nextEdges),
    componentResults: [],
    history: appendHistoryAction(graphState.history, {
      type: 'toggle-matrix',
      rowIndex,
      columnIndex,
      nextValue,
      edge: currentEdge ?? undefined,
    }),
  };
};

export const rebuildMatrixFromEdges = (graphState: GraphState): GraphState => ({
  ...graphState,
  matrix: createMatrixFromEdges(graphState.vertexCount, graphState.edges),
});

export const createInitialVertexCountControlState = (): VertexCountControlState => ({
  draftValue: String(DEFAULT_VERTEX_COUNT),
  pendingValue: null,
  isConfirmOpen: false,
});
