import type { AdjacencyMatrix, EdgeId, VertexId } from '../model/types';

export const createVertexId = (index: number): VertexId => `x${index + 1}` as VertexId;

export const createEdgeId = (source: VertexId, target: VertexId): EdgeId =>
  `${source}->${target}` as EdgeId;

export const createZeroMatrix = (vertexCount: number): AdjacencyMatrix =>
  Array.from({ length: vertexCount }, () => Array.from({ length: vertexCount }, () => 0));
