import { collectReachableVertices } from './reachability';
import { createEdgeId } from '../utils/matrixMapping';
import { getComponentColor } from '../utils/colors';
import type { ComponentResult, EdgeId, SimpleGraph, VertexId } from '../model/types';

const getVertexOrder = (vertexId: VertexId): number => Number.parseInt(vertexId.slice(1), 10);

const sortVertexIds = (vertexIds: Iterable<VertexId>): VertexId[] =>
  Array.from(vertexIds).sort((first, second) => getVertexOrder(first) - getVertexOrder(second));

const toVertexSet = (vertexIds: VertexId[]): Set<VertexId> => new Set(vertexIds);

const intersection = (first: ReadonlySet<VertexId>, second: ReadonlySet<VertexId>): Set<VertexId> => {
  const result = new Set<VertexId>();

  first.forEach((vertexId) => {
    if (second.has(vertexId)) {
      result.add(vertexId);
    }
  });

  return result;
};

const collectComponentEdgeIds = (
  vertexSet: ReadonlySet<VertexId>,
  adjacencyList: Record<VertexId, VertexId[]>,
): EdgeId[] => {
  const componentEdgeIds: EdgeId[] = [];

  sortVertexIds(vertexSet).forEach((sourceVertexId) => {
    const targets = adjacencyList[sourceVertexId] ?? [];

    targets.forEach((targetVertexId) => {
      if (!vertexSet.has(targetVertexId)) {
        return;
      }

      componentEdgeIds.push(createEdgeId(sourceVertexId, targetVertexId));
    });
  });

  return componentEdgeIds;
};

export function runMalgrange(graph: SimpleGraph): ComponentResult[] {
  const orderedVertices = sortVertexIds(graph.vertices);
  const unmarkedVertices = new Set<VertexId>(orderedVertices);
  const results: ComponentResult[] = [];

  // Реализуем стандартную схему Мальгранжа: R+(v), R-(v), пересечение и исключение из U.
  while (unmarkedVertices.size > 0) {
    const pivotVertexId = orderedVertices.find((vertexId) => unmarkedVertices.has(vertexId));

    if (!pivotVertexId) {
      break;
    }

    const reachableForward = toVertexSet(
      collectReachableVertices(pivotVertexId, graph.adjacencyList, unmarkedVertices),
    );
    const reachableBackward = toVertexSet(
      collectReachableVertices(pivotVertexId, graph.reverseAdjacencyList, unmarkedVertices),
    );
    const componentVertexSet = intersection(reachableForward, reachableBackward);
    const componentVertexIds = sortVertexIds(componentVertexSet);

    if (componentVertexIds.length === 0) {
      unmarkedVertices.delete(pivotVertexId);
      continue;
    }

    componentVertexIds.forEach((vertexId) => {
      unmarkedVertices.delete(vertexId);
    });

    const componentColor = getComponentColor(results.length);

    results.push({
      id: `component-${results.length + 1}`,
      vertexIds: componentVertexIds,
      edgeIds: collectComponentEdgeIds(componentVertexSet, graph.adjacencyList),
      color: componentColor,
    });
  }

  return results;
}

