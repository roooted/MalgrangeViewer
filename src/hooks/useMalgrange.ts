import type { ComponentResult, GraphState } from '../model/types';

type MalgrangeApi = {
  results: ComponentResult[];
  canRun: boolean;
  run: () => void;
  clear: () => void;
};

export function useMalgrange(graphState: GraphState): MalgrangeApi {
  return {
    results: graphState.componentResults,
    canRun: false,
    run: () => undefined,
    clear: () => undefined,
  };
}
