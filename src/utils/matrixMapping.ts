import type { AdjacencyMatrix, Edge, EdgeId, Vertex, VertexId } from '../model/types';

export type MatrixCellPosition = {
  rowIndex: number;
  columnIndex: number;
};

// Индексы матрицы переводим в человекочитаемые вершины x1, x2, ...
export const createVertexId = (index: number): VertexId => `x${index + 1}` as VertexId;

// Идентификатор дуги сохраняет направление, поэтому x1->x2 и x2->x1 различаются.
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
  // Матрица всегда строится заново из списка дуг, чтобы не накапливать рассинхрон.
  const matrix = createZeroMatrix(vertexCount);

  edges.forEach((edge) => {
    const rowIndex = Number.parseInt(edge.source.slice(1), 10) - 1;
    const columnIndex = Number.parseInt(edge.target.slice(1), 10) - 1;

    // Проверка защищает от дуг, не относящихся к текущему размеру графа.
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
  // Возвращаем новую матрицу без мутации старого состояния React.
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
  // Строка матрицы задаёт источник, столбец задаёт цель направленной дуги.
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
  // Некорректная ячейка не должна создавать фиктивные id.
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
  // Удаление через матрицу использует тот же id, что и удаление на графе.
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
  // null означает отсутствие выбранной или наведённой дуги.
  if (!edgeId) {
    return null;
  }

  const [sourceId, targetId] = edgeId.split('->') as [VertexId, VertexId];
  const rowIndex = vertices.findIndex((vertex) => vertex.id === sourceId);
  const columnIndex = vertices.findIndex((vertex) => vertex.id === targetId);

  // Если вершины уже пересозданы, старая дуга не имеет позиции в текущей матрице.
  if (rowIndex < 0 || columnIndex < 0) {
    return null;
  }

  return {
    rowIndex,
    columnIndex,
  };
};

