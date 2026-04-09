import type { AdjacencyMatrix, Edge, EdgeId, Vertex, VertexId } from '../model/types';

export type MatrixCellPosition = {
  rowIndex: number;
  columnIndex: number;
};

export const createVertexId = (index: number): VertexId => `x${index + 1}` as VertexId;

export const createEdgeId = (source: VertexId, target: VertexId): EdgeId =>
  `${source}->${target}` as EdgeId;

export const createEdge = (source: VertexId, target: VertexId): Edge => ({
  id: createEdgeId(source, target),
  source,
  target,
});

export const createZeroMatrix = (vertexCount: number): AdjacencyMatrix =>
  Array.from({ length: vertexCount }, () => Array.from({ length: vertexCount }, () => 0));

export const createMatrixFromEdges = (vertexCount: number, edges: Edge[]): AdjacencyMatrix => {
  const matrix = createZeroMatrix(vertexCount);

  edges.forEach((edge) => {
    const rowIndex = Number.parseInt(edge.source.slice(1), 10) - 1;
    const columnIndex = Number.parseInt(edge.target.slice(1), 10) - 1;

    if (matrix[rowIndex]?.[columnIndex] !== undefined) {
      matrix[rowIndex][columnIndex] = 1;
    }
  });

  return matrix;
};

export const toggleMatrixValue = (
  matrix: AdjacencyMatrix,
  rowIndex: number,
  columnIndex: number,
): AdjacencyMatrix =>
  matrix.map((row, currentRowIndex) =>
    row.map((value, currentColumnIndex) => {
      if (currentRowIndex === rowIndex && currentColumnIndex === columnIndex) {
        return value === 0 ? 1 : 0;
      }

      return value;
    }),
  );

export const createEdgeFromIndexes = (
  vertices: Vertex[],
  rowIndex: number,
  columnIndex: number,
): Edge => {
  const source = vertices[rowIndex].id;
  const target = vertices[columnIndex].id;

  return createEdge(source, target);
};

export const findEdgeById = (edges: Edge[], edgeId: EdgeId): Edge | null =>
  edges.find((edge) => edge.id === edgeId) ?? null;

export const hasEdgeId = (edges: Edge[], edgeId: EdgeId): boolean =>
  edges.some((edge) => edge.id === edgeId);

export const findEdgeByIndexes = (
  edges: Edge[],
  vertices: Vertex[],
  rowIndex: number,
  columnIndex: number,
): Edge | null => {
  const source = vertices[rowIndex]?.id;
  const target = vertices[columnIndex]?.id;

  if (!source || !target) {
    return null;
  }

  const edgeId = createEdgeId(source, target);

  return findEdgeById(edges, edgeId);
};

export const removeEdgeById = (edges: Edge[], edgeId: EdgeId): Edge[] =>
  edges.filter((edge) => edge.id !== edgeId);

export const removeEdgeByIndexes = (
  edges: Edge[],
  vertices: Vertex[],
  rowIndex: number,
  columnIndex: number,
): Edge[] => {
  const source = vertices[rowIndex]?.id;
  const target = vertices[columnIndex]?.id;

  if (!source || !target) {
    return edges;
  }

  const edgeId = createEdgeId(source, target);

  return removeEdgeById(edges, edgeId);
};

export const getMatrixPositionByEdgeId = (
  edgeId: EdgeId | null,
  vertices: Vertex[],
): MatrixCellPosition | null => {
  if (!edgeId) {
    return null;
  }

  const [sourceId, targetId] = edgeId.split('->') as [VertexId, VertexId];
  const rowIndex = vertices.findIndex((vertex) => vertex.id === sourceId);
  const columnIndex = vertices.findIndex((vertex) => vertex.id === targetId);

  if (rowIndex < 0 || columnIndex < 0) {
    return null;
  }

  return {
    rowIndex,
    columnIndex,
  };
};

