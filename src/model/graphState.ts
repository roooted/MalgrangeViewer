import type {
  Edge,
  EdgeId,
  GraphState,
  HistoryAction,
  HistoryState,
  Vertex,
  VertexCountControlState,
  VertexId,
} from './types';
import type { ComponentResult, SimpleGraph } from './types';
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

const isVertexInGraph = (graphState: GraphState, vertexId: VertexId): boolean =>
  graphState.vertices.some((vertex) => vertex.id === vertexId);

const buildStateWithEdges = (graphState: GraphState, nextEdges: Edge[]): GraphState => {
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
    pendingEdgeSourceId: null,
    componentResults: [],
  };
};

const applyEdgeSetChange = (
  graphState: GraphState,
  nextEdges: Edge[],
  historyAction: HistoryAction,
): GraphState => {
  const nextState = buildStateWithEdges(graphState, nextEdges);

  return {
    ...nextState,
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

export const startEdgeCreation = (graphState: GraphState, sourceVertexId: VertexId): GraphState => {
  if (!isVertexInGraph(graphState, sourceVertexId)) {
    return graphState;
  }

  return {
    ...graphState,
    pendingEdgeSourceId: sourceVertexId,
    selectedEdgeId: null,
    hoveredEdgeId: null,
  };
};

export const cancelEdgeCreation = (graphState: GraphState): GraphState => {
  if (graphState.pendingEdgeSourceId === null) {
    return graphState;
  }

  return {
    ...graphState,
    pendingEdgeSourceId: null,
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
  const nextEdges = removeEdgeById(stateWithoutSelection.edges, selectedEdge.id);

  return applyEdgeSetChange(stateWithoutSelection, nextEdges, {
    type: 'remove-edge',
    edge: selectedEdge,
  });
};

const ensureEdgeFromAction = (graphState: GraphState, action: HistoryAction): Edge | null => {
  if (action.edge) {
    return action.edge;
  }

  if (action.rowIndex === undefined || action.columnIndex === undefined) {
    return null;
  }

  if (!graphState.vertices[action.rowIndex] || !graphState.vertices[action.columnIndex]) {
    return null;
  }

  return createEdgeFromIndexes(graphState.vertices, action.rowIndex, action.columnIndex);
};

const applyHistoryActionToEdges = (
  graphState: GraphState,
  action: HistoryAction,
  direction: 'undo' | 'redo',
): Edge[] => {
  if (action.type === 'add-edge') {
    if (!action.edge) {
      return graphState.edges;
    }

    if (direction === 'undo') {
      return removeEdgeById(graphState.edges, action.edge.id);
    }

    return hasEdgeId(graphState.edges, action.edge.id) ? graphState.edges : [...graphState.edges, action.edge];
  }

  if (action.type === 'remove-edge') {
    if (!action.edge) {
      return graphState.edges;
    }

    if (direction === 'undo') {
      return hasEdgeId(graphState.edges, action.edge.id) ? graphState.edges : [...graphState.edges, action.edge];
    }

    return removeEdgeById(graphState.edges, action.edge.id);
  }

  if (action.type === 'toggle-matrix') {
    if (action.rowIndex === undefined || action.columnIndex === undefined || action.nextValue === undefined) {
      return graphState.edges;
    }

    const shouldBeOne = direction === 'undo' ? action.nextValue === 0 : action.nextValue === 1;

    if (shouldBeOne) {
      const edge = ensureEdgeFromAction(graphState, action);

      if (!edge || hasEdgeId(graphState.edges, edge.id)) {
        return graphState.edges;
      }

      return [...graphState.edges, edge];
    }

    return removeEdgeByIndexes(graphState.edges, graphState.vertices, action.rowIndex, action.columnIndex);
  }

  return graphState.edges;
};

export const undoGraphState = (graphState: GraphState): GraphState => {
  const { past, future } = graphState.history;

  if (past.length === 0) {
    return graphState;
  }

  const action = past[past.length - 1];
  const nextEdges = applyHistoryActionToEdges(graphState, action, 'undo');
  const nextState = buildStateWithEdges(graphState, nextEdges);

  return {
    ...nextState,
    history: {
      past: past.slice(0, -1),
      future: [...future, action],
    },
  };
};

export const redoGraphState = (graphState: GraphState): GraphState => {
  const { past, future } = graphState.history;

  if (future.length === 0) {
    return graphState;
  }

  const action = future[future.length - 1];
  const nextEdges = applyHistoryActionToEdges(graphState, action, 'redo');
  const nextState = buildStateWithEdges(graphState, nextEdges);

  return {
    ...nextState,
    history: {
      past: [...past, action],
      future: future.slice(0, -1),
    },
  };
};

export const createInitialVertexCountControlState = (): VertexCountControlState => ({
  draftValue: String(DEFAULT_VERTEX_COUNT),
  pendingValue: null,
  isConfirmOpen: false,
});


type ComponentColorMaps = {
  vertexColorById: Partial<Record<VertexId, string>>;
  edgeColorById: Partial<Record<EdgeId, string>>;
};

export const buildSimpleGraphFromState = (graphState: GraphState): SimpleGraph => {
  const adjacencyList = Object.fromEntries(
    graphState.vertices.map((vertex) => [vertex.id, [] as VertexId[]]),
  ) as Record<VertexId, VertexId[]>;
  const reverseAdjacencyList = Object.fromEntries(
    graphState.vertices.map((vertex) => [vertex.id, [] as VertexId[]]),
  ) as Record<VertexId, VertexId[]>;

  graphState.edges.forEach((edge) => {
    adjacencyList[edge.source]?.push(edge.target);
    reverseAdjacencyList[edge.target]?.push(edge.source);
  });

  return {
    vertices: graphState.vertices.map((vertex) => vertex.id),
    adjacencyList,
    reverseAdjacencyList,
  };
};

export const applyComponentResultsToState = (
  graphState: GraphState,
  componentResults: ComponentResult[],
): GraphState => ({
  ...graphState,
  componentResults,
});

export const createComponentColorMaps = (
  componentResults: ComponentResult[],
): ComponentColorMaps => {
  const vertexColorById: Partial<Record<VertexId, string>> = {};
  const edgeColorById: Partial<Record<EdgeId, string>> = {};

  // Цвет компоненты пробрасываем отдельно для вершин и внутренних дуг.
  componentResults.forEach((component) => {
    component.vertexIds.forEach((vertexId) => {
      vertexColorById[vertexId] = component.color;
    });

    component.edgeIds.forEach((edgeId) => {
      edgeColorById[edgeId] = component.color;
    });
  });

  return {
    vertexColorById,
    edgeColorById,
  };
};

