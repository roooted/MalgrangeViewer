import type { Edge, EdgeId } from '../model/types';
import { createEdgeId } from './matrixMapping';

export const getOppositeEdgeId = (edge: Edge): EdgeId => createEdgeId(edge.target, edge.source);

export const hasMutualPair = (edge: Edge, edges: Edge[]): boolean =>
  edges.some((candidate) => candidate.id === getOppositeEdgeId(edge));
