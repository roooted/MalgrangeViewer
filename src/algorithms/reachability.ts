import type { VertexId } from '../model/types';

// Универсальный обход достижимости используется и для прямого, и для обратного графа.
export function collectReachableVertices(
  startVertexId: VertexId,
  adjacencyList: Record<VertexId, VertexId[]>,
  allowedVertices?: ReadonlySet<VertexId>,
): VertexId[] {
  // Если стартовая вершина уже исключена из U, обход сразу пустой.
  if (allowedVertices && !allowedVertices.has(startVertexId)) {
    return [];
  }

  // visited защищает от циклов, петель и повторного обхода одной вершины.
  const visited = new Set<VertexId>();
  // Стек делает обход итеративным, чтобы не зависеть от глубины рекурсии.
  const stack: VertexId[] = [startVertexId];

  // Обход достижимости нужен для построения R+ и R- в алгоритме Мальгранжа.
  while (stack.length > 0) {
    const currentVertexId = stack.pop();

    // Повторно посещённые вершины пропускаем, иначе петли могут зациклить обход.
    if (!currentVertexId || visited.has(currentVertexId)) {
      continue;
    }

    // allowedVertices ограничивает обход ещё не размеченной частью графа.
    if (allowedVertices && !allowedVertices.has(currentVertexId)) {
      continue;
    }

    visited.add(currentVertexId);

    const neighbors = adjacencyList[currentVertexId] ?? [];

    // Идём с конца, чтобы порядок извлечения из стека соответствовал порядку списка смежности.
    for (let index = neighbors.length - 1; index >= 0; index -= 1) {
      const neighbor = neighbors[index];

      // Соседей вне текущего множества U не добавляем в дальнейший обход.
      if (allowedVertices && !allowedVertices.has(neighbor)) {
        continue;
      }

      // В стек попадают только ещё не обработанные достижимые вершины.
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return Array.from(visited);
}

