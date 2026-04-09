import { useMemo, useState } from 'react';
import {
  applyMatrixToggle,
  cancelEdgeCreation,
  clampVertexCount,
  createEmptyGraphState,
  createInitialVertexCountControlState,
  deleteSelectedEdge,
  finalizeEdgeCreation,
  reconstructGraphState,
  selectEdge,
  setHoveredEdge,
  startEdgeCreation,
} from '../model/graphState';
import type { EdgeId, GraphState, VertexCountControlState, VertexId } from '../model/types';
import { getMatrixPositionByEdgeId, type MatrixCellPosition } from '../utils/matrixMapping';

type GraphEditorApi = {
  graphState: GraphState;
  vertexCountControl: VertexCountControlState;
  hoveredMatrixCell: MatrixCellPosition | null;
  selectedMatrixCell: MatrixCellPosition | null;
  setVertexCountDraft: (value: string) => void;
  openVertexCountConfirmation: () => void;
  confirmVertexCountReconstruction: () => void;
  cancelVertexCountReconstruction: () => void;
  toggleMatrixCell: (rowIndex: number, columnIndex: number) => void;
  handleNodeClick: (vertexId: VertexId) => void;
  handleEdgeHover: (edgeId: EdgeId | null) => void;
  handleEdgeSelect: (edgeId: EdgeId) => void;
  cancelPendingEdgeCreation: () => void;
  deleteSelectedGraphEdge: () => void;
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

  const handleNodeClick = (vertexId: VertexId) => {
    setGraphState((currentState) => {
      if (currentState.pendingEdgeSourceId === null) {
        return startEdgeCreation(currentState, vertexId);
      }

      return finalizeEdgeCreation(currentState, vertexId);
    });
  };

  const handleEdgeHover = (edgeId: EdgeId | null) => {
    setGraphState((currentState) => setHoveredEdge(currentState, edgeId));
  };

  const handleEdgeSelect = (edgeId: EdgeId) => {
    setGraphState((currentState) => {
      if (currentState.pendingEdgeSourceId !== null) {
        return currentState;
      }

      return selectEdge(currentState, edgeId);
    });
  };

  const cancelPendingEdgeCreation = () => {
    setGraphState((currentState) => cancelEdgeCreation(currentState));
  };

  const deleteSelectedGraphEdge = () => {
    setGraphState((currentState) => deleteSelectedEdge(currentState));
  };

  const hoveredMatrixCell = useMemo(
    () => getMatrixPositionByEdgeId(graphState.hoveredEdgeId, graphState.vertices),
    [graphState.hoveredEdgeId, graphState.vertices],
  );

  const selectedMatrixCell = useMemo(
    () => getMatrixPositionByEdgeId(graphState.selectedEdgeId, graphState.vertices),
    [graphState.selectedEdgeId, graphState.vertices],
  );

  return {
    graphState,
    vertexCountControl,
    hoveredMatrixCell,
    selectedMatrixCell,
    setVertexCountDraft,
    openVertexCountConfirmation,
    confirmVertexCountReconstruction,
    cancelVertexCountReconstruction,
    toggleMatrixCell,
    handleNodeClick,
    handleEdgeHover,
    handleEdgeSelect,
    cancelPendingEdgeCreation,
    deleteSelectedGraphEdge,
  };
}
