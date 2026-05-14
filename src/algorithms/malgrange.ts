import { collectReachableVertices } from './reachability';
import { createEdgeId } from '../utils/matrixMapping';
import { getComponentColor } from '../utils/colors';
import type { ComponentResult, EdgeId, SimpleGraph, VertexId } from '../model/types';

// Числовой порядок берём из подписи xN, чтобы результаты были стабильными для UI и тестов.
const getVertexOrder = (vertexId: VertexId): number => Number.parseInt(vertexId.slice(1), 10);

// Сортировка возвращает вершины в естественном порядке x1, x2, x3, ...
const sortVertexIds = (vertexIds: Iterable<VertexId>): VertexId[] =>
  Array.from(vertexIds).sort((first, second) => getVertexOrder(first) - getVertexOrder(second));

// Множество нужно для быстрых проверок принадлежности при пересечении и фильтрации.
const toVertexSet = (vertexIds: VertexId[]): Set<VertexId> => new Set(vertexIds);

// Пересечение R+(v) и R-(v) даёт компоненту сильной связности выбранной вершины.
const intersection = (first: ReadonlySet<VertexId>, second: ReadonlySet<VertexId>): Set<VertexId> => {
  const result = new Set<VertexId>();

  first.forEach((vertexId) => {
    // Оставляем только вершины, достижимые в обе стороны относительно опорной вершины.
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

  // В результат попадают только дуги, у которых оба конца лежат внутри найденной компоненты.
  sortVertexIds(vertexSet).forEach((sourceVertexId) => {
    const targets = adjacencyList[sourceVertexId] ?? [];

    targets.forEach((targetVertexId) => {
      // Внешние исходящие дуги не окрашиваются цветом компоненты.
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
    // Опорную вершину выбираем первой среди ещё не размеченных, сохраняя предсказуемый порядок.
    const pivotVertexId = orderedVertices.find((vertexId) => unmarkedVertices.has(vertexId));

    if (!pivotVertexId) {
      break;
    }

    // R+(v): все ещё не размеченные вершины, достижимые из опорной по исходным дугам.
    const reachableForward = toVertexSet(
      collectReachableVertices(pivotVertexId, graph.adjacencyList, unmarkedVertices),
    );
    // R-(v): все ещё не размеченные вершины, из которых достижима опорная в исходном графе.
    const reachableBackward = toVertexSet(
      collectReachableVertices(pivotVertexId, graph.reverseAdjacencyList, unmarkedVertices),
    );
    // Компонента сильной связности состоит из вершин, попавших в оба множества достижимости.
    const componentVertexSet = intersection(reachableForward, reachableBackward);
    const componentVertexIds = sortVertexIds(componentVertexSet);

    // Защитная ветка оставляет цикл конечным даже при неожиданно пустом пересечении.
    if (componentVertexIds.length === 0) {
      unmarkedVertices.delete(pivotVertexId);
      continue;
    }

    // Найденная компонента больше не участвует в следующих итерациях алгоритма.
    componentVertexIds.forEach((vertexId) => {
      unmarkedVertices.delete(vertexId);
    });

    // Цвет назначается на уровне алгоритмического результата, а не внутри UI-компонентов.
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

