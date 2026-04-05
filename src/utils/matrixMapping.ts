import type { AdjacencyMatrix, Edge, EdgeId, Vertex, VertexId } from '../model/types';

export const createVertexId = (index: number): VertexId => `x${index + 1}` as VertexId;

export const createEdgeId = (source: VertexId, target: VertexId): EdgeId =>
  `${source}->${target}` as EdgeId;

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

  return {
    id: createEdgeId(source, target),
    source,
    target,
  };
};

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

  return edges.find((edge) => edge.id === edgeId) ?? null;
};

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

  return edges.filter((edge) => edge.id !== edgeId);
};
