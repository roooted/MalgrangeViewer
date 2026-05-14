import { useCallback } from 'react';
import { runMalgrange } from '../algorithms/malgrange';
import { buildSimpleGraphFromState } from '../model/graphState';
import type { ComponentResult, GraphState } from '../model/types';

type MalgrangeApi = {
  results: ComponentResult[];
  canRun: boolean;
  run: () => void;
  clear: () => void;
};

export function useMalgrange(
  graphState: GraphState,
  applyResults: (componentResults: ComponentResult[]) => void,
): MalgrangeApi {
  const run = useCallback(() => {
    // Перед запуском алгоритма состояние UI переводится в простой граф.
    const simpleGraph = buildSimpleGraphFromState(graphState);
    const componentResults = runMalgrange(simpleGraph);

    // Результат возвращается в graph state только как данные для подсветки.
    applyResults(componentResults);
  }, [applyResults, graphState]);

  const clear = useCallback(() => {
    // Очистка результата не трогает вершины, дуги и матрицу.
    applyResults([]);
  }, [applyResults]);

  return {
    results: graphState.componentResults,
    canRun: graphState.vertices.length > 0,
    run,
    clear,
  };
}

