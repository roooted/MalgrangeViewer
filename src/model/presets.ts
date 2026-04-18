import { createMatrixFromEdges, createEdgeFromIndexes } from '../utils/matrixMapping';
import { createEmptyGraphState } from './graphState';
import type { GraphState } from './types';

const EXAMPLE_VERTEX_COUNT = 11;
const EXAMPLE_EDGE_INDEXES: Array<[number, number]> = [
  [0, 6],
  [1, 0],
  [1, 1],
  [1, 7],
  [1, 10],
  [2, 2],
  [2, 3],
  [2, 8],
  [2, 9],
  [3, 3],
  [3, 4],
  [4, 3],
  [5, 5],
  [6, 10],
  [8, 2],
  [9, 3],
  [9, 4],
  [9, 8],
  [10, 0],
  [10, 4],
  [10, 5],
];

export const EXAMPLE_PRESET_AVAILABLE = true;

export const getExamplePreset = (): GraphState => {
  const baseState = createEmptyGraphState(EXAMPLE_VERTEX_COUNT);
  const edges = EXAMPLE_EDGE_INDEXES.map(([rowIndex, columnIndex]) =>
    createEdgeFromIndexes(baseState.vertices, rowIndex, columnIndex),
  );

  return {
    ...baseState,
    edges,
    matrix: createMatrixFromEdges(baseState.vertexCount, edges),
  };
};
