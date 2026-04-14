import { useCallback } from 'react';
import type { HistoryState } from '../model/types';

type UndoRedoApi = {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

export function useUndoRedo(
  history: HistoryState,
  onUndo: () => void,
  onRedo: () => void,
): UndoRedoApi {
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) {
      return;
    }

    onUndo();
  }, [canUndo, onUndo]);

  const redo = useCallback(() => {
    if (!canRedo) {
      return;
    }

    onRedo();
  }, [canRedo, onRedo]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
  };
}
