import { useState } from 'react';
import {
  applyMatrixToggle,
  clampVertexCount,
  createEmptyGraphState,
  createInitialVertexCountControlState,
  reconstructGraphState,
} from '../model/graphState';
import type { GraphState, VertexCountControlState } from '../model/types';

type GraphEditorApi = {
  graphState: GraphState;
  vertexCountControl: VertexCountControlState;
  setVertexCountDraft: (value: string) => void;
  openVertexCountConfirmation: () => void;
  confirmVertexCountReconstruction: () => void;
  cancelVertexCountReconstruction: () => void;
  toggleMatrixCell: (rowIndex: number, columnIndex: number) => void;
};

export function useGraphEditor(): GraphEditorApi {
  const [graphState, setGraphState] = useState<GraphState>(() => createEmptyGraphState());
  const [vertexCountControl, setVertexCountControl] = useState<VertexCountControlState>(() =>
    createInitialVertexCountControlState(),
  );

  const setVertexCountDraft = (value: string) => {
    setVertexCountControl((currentState) => ({
      ...currentState,
      draftValue: value,
    }));
  };

  const openVertexCountConfirmation = () => {
    const parsedValue = Number.parseInt(vertexCountControl.draftValue, 10);

    // Пустое или некорректное значение возвращаем к текущему размеру графа без перестройки.
    if (Number.isNaN(parsedValue)) {
      setVertexCountControl((currentState) => ({
        ...currentState,
        draftValue: String(graphState.vertexCount),
        pendingValue: null,
        isConfirmOpen: false,
      }));
      return;
    }

    const nextVertexCount = clampVertexCount(parsedValue);

    if (nextVertexCount === graphState.vertexCount) {
      setVertexCountControl((currentState) => ({
        ...currentState,
        draftValue: String(nextVertexCount),
        pendingValue: null,
        isConfirmOpen: false,
      }));
      return;
    }

    setVertexCountControl((currentState) => ({
      ...currentState,
      draftValue: String(nextVertexCount),
      pendingValue: nextVertexCount,
      isConfirmOpen: true,
    }));
  };

  const confirmVertexCountReconstruction = () => {
    if (vertexCountControl.pendingValue === null) {
      return;
    }

    setGraphState(reconstructGraphState(vertexCountControl.pendingValue));
    setVertexCountControl({
      draftValue: String(vertexCountControl.pendingValue),
      pendingValue: null,
      isConfirmOpen: false,
    });
  };

  const cancelVertexCountReconstruction = () => {
    setVertexCountControl({
      draftValue: String(graphState.vertexCount),
      pendingValue: null,
      isConfirmOpen: false,
    });
  };

  const toggleMatrixCell = (rowIndex: number, columnIndex: number) => {
    // Все изменения матрицы проходят через graph state layer, который сразу пересобирает список дуг.
    setGraphState((currentState) => applyMatrixToggle(currentState, rowIndex, columnIndex));
  };

  return {
    graphState,
    vertexCountControl,
    setVertexCountDraft,
    openVertexCountConfirmation,
    confirmVertexCountReconstruction,
    cancelVertexCountReconstruction,
    toggleMatrixCell,
  };
}
