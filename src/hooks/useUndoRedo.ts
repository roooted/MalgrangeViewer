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
  // Доступность кнопок напрямую следует из двух стеков истории.
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const undo = useCallback(() => {
    // Защищаем обработчики клавиатуры и кнопки от пустого undo.
    if (!canUndo) {
      return;
    }

    onUndo();
  }, [canUndo, onUndo]);

  const redo = useCallback(() => {
    // Redo выполняется только если есть действие в будущем стеке.
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
