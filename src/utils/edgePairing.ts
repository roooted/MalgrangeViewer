import type { Edge, EdgeId } from '../model/types';
import { createEdgeId } from './matrixMapping';

// Для встречной дуги меняем местами источник и цель.
export const getOppositeEdgeId = (edge: Edge): EdgeId => createEdgeId(edge.target, edge.source);

// Встречная пара рисуется кривыми дугами, чтобы направления не сливались.
export const hasMutualPair = (edge: Edge, edges: Edge[]): boolean =>
  edges.some((candidate) => candidate.id === getOppositeEdgeId(edge));
