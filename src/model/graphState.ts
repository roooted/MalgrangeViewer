import type { GraphState, HistoryState, Vertex, VertexCountControlState } from './types';
import { createVertexId, createZeroMatrix } from '../utils/matrixMapping';

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

// При реконструкции на первом этапе полностью сбрасываем граф и служебные состояния.
export const reconstructGraphState = (vertexCount: number): GraphState =>
  createEmptyGraphState(vertexCount);

export const createInitialVertexCountControlState = (): VertexCountControlState => ({
  draftValue: String(DEFAULT_VERTEX_COUNT),
  pendingValue: null,
  isConfirmOpen: false,
});
