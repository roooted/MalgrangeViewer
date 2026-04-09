import type {
  Edge,
  EdgeId,
  FlowPoint,
  GraphState,
  HistoryAction,
  HistoryState,
  Vertex,
  VertexCountControlState,
  VertexId,
} from './types';
import {
  createEdge,
  createEdgeFromIndexes,
  createEdgeId,
  createMatrixFromEdges,
  createVertexId,
  createZeroMatrix,
  findEdgeById,
  findEdgeByIndexes,
  hasEdgeId,
  removeEdgeById,
  removeEdgeByIndexes,
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
    hoveredVertexId: null,
    pendingEdgeSourceId: null,
    pendingEdgeTarget: null,
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

const isVertexInGraph = (graphState: GraphState, vertexId: VertexId): boolean =>
  graphState.vertices.some((vertex) => vertex.id === vertexId);

const applyEdgeSetChange = (
  graphState: GraphState,
  nextEdges: Edge[],
  historyAction: HistoryAction,
): GraphState => {
  const edgeIdSet = new Set(nextEdges.map((edge) => edge.id));

  return {
    ...graphState,
    edges: nextEdges,
    matrix: createMatrixFromEdges(graphState.vertexCount, nextEdges),
    selectedEdgeId:
      graphState.selectedEdgeId && edgeIdSet.has(graphState.selectedEdgeId)
        ? graphState.selectedEdgeId
        : null,
    hoveredEdgeId:
      graphState.hoveredEdgeId && edgeIdSet.has(graphState.hoveredEdgeId)
        ? graphState.hoveredEdgeId
        : null,
    componentResults: [],
    history: appendHistoryAction(graphState.history, historyAction),
  };
};

export const applyMatrixToggle = (
  graphState: GraphState,
  rowIndex: number,
  columnIndex: number,
): GraphState => {
  if (rowIndex < 0 || columnIndex < 0) {
    return graphState;
  }

  const currentEdge = findEdgeByIndexes(graphState.edges, graphState.vertices, rowIndex, columnIndex);

  if (currentEdge) {
    const nextEdges = removeEdgeByIndexes(graphState.edges, graphState.vertices, rowIndex, columnIndex);

    return applyEdgeSetChange(graphState, nextEdges, {
      type: 'toggle-matrix',
      rowIndex,
      columnIndex,
      nextValue: 0,
      edge: currentEdge,
    });
  }

  if (!graphState.vertices[rowIndex] || !graphState.vertices[columnIndex]) {
    return graphState;
  }

  const nextEdge = createEdgeFromIndexes(graphState.vertices, rowIndex, columnIndex);

  return applyEdgeSetChange(graphState, [...graphState.edges, nextEdge], {
    type: 'toggle-matrix',
    rowIndex,
    columnIndex,
    nextValue: 1,
    edge: nextEdge,
  });
};

export const rebuildMatrixFromEdges = (graphState: GraphState): GraphState => ({
  ...graphState,
  matrix: createMatrixFromEdges(graphState.vertexCount, graphState.edges),
});

export const setHoveredVertex = (
  graphState: GraphState,
  hoveredVertexId: VertexId | null,
): GraphState => {
  if (hoveredVertexId !== null && !isVertexInGraph(graphState, hoveredVertexId)) {
    return {
      ...graphState,
      hoveredVertexId: null,
    };
  }

  if (graphState.hoveredVertexId === hoveredVertexId) {
    return graphState;
  }

  return {
    ...graphState,
    hoveredVertexId,
  };
};

export const setHoveredEdge = (graphState: GraphState, hoveredEdgeId: EdgeId | null): GraphState => {
  if (hoveredEdgeId !== null && !hasEdgeId(graphState.edges, hoveredEdgeId)) {
    if (graphState.hoveredEdgeId === null) {
      return graphState;
    }

    return {
      ...graphState,
      hoveredEdgeId: null,
    };
  }

  if (graphState.hoveredEdgeId === hoveredEdgeId) {
    return graphState;
  }

  return {
    ...graphState,
    hoveredEdgeId,
  };
};

export const selectEdge = (graphState: GraphState, edgeId: EdgeId | null): GraphState => {
  if (edgeId !== null && !hasEdgeId(graphState.edges, edgeId)) {
    return {
      ...graphState,
      selectedEdgeId: null,
    };
  }

  if (graphState.selectedEdgeId === edgeId) {
    return graphState;
  }

  return {
    ...graphState,
    selectedEdgeId: edgeId,
  };
};

export const startEdgeCreation = (
  graphState: GraphState,
  sourceVertexId: VertexId,
  initialTarget: FlowPoint | null,
): GraphState => {
  if (!isVertexInGraph(graphState, sourceVertexId)) {
    return graphState;
  }

  return {
    ...graphState,
    pendingEdgeSourceId: sourceVertexId,
    pendingEdgeTarget: initialTarget,
    selectedEdgeId: null,
    hoveredEdgeId: null,
  };
};

// Временная дуга живет в состоянии графа, чтобы UI и матрица читали единый источник истины.
export const updatePendingEdgeTarget = (
  graphState: GraphState,
  point: FlowPoint,
): GraphState => {
  if (graphState.pendingEdgeSourceId === null) {
    return graphState;
  }

  return {
    ...graphState,
    pendingEdgeTarget: point,
  };
};

export const cancelEdgeCreation = (graphState: GraphState): GraphState => {
  if (graphState.pendingEdgeSourceId === null && graphState.pendingEdgeTarget === null) {
    return graphState;
  }

  return {
    ...graphState,
    pendingEdgeSourceId: null,
    pendingEdgeTarget: null,
  };
};

export const finalizeEdgeCreation = (graphState: GraphState, targetVertexId: VertexId): GraphState => {
  const sourceVertexId = graphState.pendingEdgeSourceId;

  if (sourceVertexId === null) {
    return graphState;
  }

  const clearedCreationState: GraphState = {
    ...graphState,
    pendingEdgeSourceId: null,
    pendingEdgeTarget: null,
  };

  if (!isVertexInGraph(clearedCreationState, targetVertexId)) {
    return clearedCreationState;
  }

  const nextEdgeId = createEdgeId(sourceVertexId, targetVertexId);

  if (hasEdgeId(clearedCreationState.edges, nextEdgeId)) {
    return clearedCreationState;
  }

  const nextEdge = createEdge(sourceVertexId, targetVertexId);

  return applyEdgeSetChange(clearedCreationState, [...clearedCreationState.edges, nextEdge], {
    type: 'add-edge',
    edge: nextEdge,
  });
};

export const deleteSelectedEdge = (graphState: GraphState): GraphState => {
  if (!graphState.selectedEdgeId) {
    return graphState;
  }

  const selectedEdge = findEdgeById(graphState.edges, graphState.selectedEdgeId);

  if (!selectedEdge) {
    return {
      ...graphState,
      selectedEdgeId: null,
    };
  }

  const stateWithoutSelection: GraphState = {
    ...graphState,
    selectedEdgeId: null,
  };
  const nextEdges = removeEdgeById(graphState.edges, selectedEdge.id);

  return applyEdgeSetChange(stateWithoutSelection, nextEdges, {
    type: 'remove-edge',
    edge: selectedEdge,
  });
};

export const createInitialVertexCountControlState = (): VertexCountControlState => ({
  draftValue: String(DEFAULT_VERTEX_COUNT),
  pendingValue: null,
  isConfirmOpen: false,
});

