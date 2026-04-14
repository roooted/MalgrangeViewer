import { createMatrixFromEdges, createEdgeFromIndexes } from '../utils/matrixMapping';
import { createEmptyGraphState } from './graphState';
import type { GraphState } from './types';

const EXAMPLE_VERTEX_COUNT = 8;
const EXAMPLE_EDGE_INDEXES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 0],
  [2, 3],
  [4, 5],
  [5, 4],
  [7, 7],
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
