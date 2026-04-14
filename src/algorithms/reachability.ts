import type { VertexId } from '../model/types';

export function collectReachableVertices(
  startVertexId: VertexId,
  adjacencyList: Record<VertexId, VertexId[]>,
  allowedVertices?: ReadonlySet<VertexId>,
): VertexId[] {
  if (allowedVertices && !allowedVertices.has(startVertexId)) {
    return [];
  }

  const visited = new Set<VertexId>();
  const stack: VertexId[] = [startVertexId];

  // Обход достижимости нужен для построения R+ и R- в алгоритме Мальгранжа.
  while (stack.length > 0) {
    const currentVertexId = stack.pop();

    if (!currentVertexId || visited.has(currentVertexId)) {
      continue;
    }

    if (allowedVertices && !allowedVertices.has(currentVertexId)) {
      continue;
    }

    visited.add(currentVertexId);

    const neighbors = adjacencyList[currentVertexId] ?? [];

    for (let index = neighbors.length - 1; index >= 0; index -= 1) {
      const neighbor = neighbors[index];

      if (allowedVertices && !allowedVertices.has(neighbor)) {
        continue;
      }

      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return Array.from(visited);
}

