import type { HistoryState } from '../model/types';

type UndoRedoApi = {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

export function useUndoRedo(history: HistoryState): UndoRedoApi {
  return {
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undo: () => undefined,
    redo: () => undefined,
  };
}
