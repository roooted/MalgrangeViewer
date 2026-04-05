import type { HistoryState } from '../model/types';

type UndoRedoApi = {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

export function useUndoRedo(_history: HistoryState): UndoRedoApi {
  return {
    canUndo: false,
    canRedo: false,
    undo: () => undefined,
    redo: () => undefined,
  };
}
