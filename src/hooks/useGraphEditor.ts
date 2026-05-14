import { useMemo, useState } from 'react';
import {
  applyComponentResultsToState,
  applyMatrixToggle,
  cancelEdgeCreation,
  clampVertexCount,
  createEmptyGraphState,
  createInitialVertexCountControlState,
  deleteSelectedEdge,
  finalizeEdgeCreation,
  reconstructGraphState,
  redoGraphState,
  selectEdge,
  setHoveredEdge,
  startEdgeCreation,
  undoGraphState,
} from '../model/graphState';
import { EXAMPLE_PRESET_AVAILABLE, getExamplePreset } from '../model/presets';
import type {
  ComponentResult,
  EdgeId,
  GraphState,
  VertexCountControlState,
  VertexId,
} from '../model/types';
import { getMatrixPositionByEdgeId, type MatrixCellPosition } from '../utils/matrixMapping';

type GraphEditorApi = {
  graphState: GraphState;
  vertexCountControl: VertexCountControlState;
  isClearConfirmOpen: boolean;
  hoveredMatrixCell: MatrixCellPosition | null;
  selectedMatrixCell: MatrixCellPosition | null;
  canUndo: boolean;
  canRedo: boolean;
  canLoadExample: boolean;
  setVertexCountDraft: (value: string) => void;
  openVertexCountConfirmation: () => void;
  confirmVertexCountReconstruction: () => void;
  cancelVertexCountReconstruction: () => void;
  openClearConfirmation: () => void;
  confirmClearGraph: () => void;
  cancelClearGraph: () => void;
  loadExampleGraph: () => void;
  undo: () => void;
  redo: () => void;
  toggleMatrixCell: (rowIndex: number, columnIndex: number) => void;
  handleNodeClick: (vertexId: VertexId) => void;
  handleEdgeHover: (edgeId: EdgeId | null) => void;
  handleEdgeSelect: (edgeId: EdgeId) => void;
  cancelPendingEdgeCreation: () => void;
  deleteSelectedGraphEdge: () => void;
  applyMalgrangeResults: (componentResults: ComponentResult[]) => void;
};

export function useGraphEditor(): GraphEditorApi {
  // Хук собирает весь graph state layer в один API для компонентов интерфейса.
  const [graphState, setGraphState] = useState<GraphState>(() => createEmptyGraphState());
  const [vertexCountControl, setVertexCountControl] = useState<VertexCountControlState>(() =>
    createInitialVertexCountControlState(),
  );
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

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

    // Если размер не изменился, подтверждение не нужно.
    if (nextVertexCount === graphState.vertexCount) {
      setVertexCountControl((currentState) => ({
        ...currentState,
        draftValue: String(nextVertexCount),
        pendingValue: null,
        isConfirmOpen: false,
      }));
      return;
    }

    setIsClearConfirmOpen(false);
    setVertexCountControl((currentState) => ({
      ...currentState,
      draftValue: String(nextVertexCount),
      pendingValue: nextVertexCount,
      isConfirmOpen: true,
    }));
  };

  const confirmVertexCountReconstruction = () => {
    // Подтверждать можно только заранее сохранённое значение из модального окна.
    if (vertexCountControl.pendingValue === null) {
      return;
    }

    setGraphState(reconstructGraphState(vertexCountControl.pendingValue));
    setVertexCountControl({
      draftValue: String(vertexCountControl.pendingValue),
      pendingValue: null,
      isConfirmOpen: false,
    });
    setIsClearConfirmOpen(false);
  };

  const cancelVertexCountReconstruction = () => {
    setVertexCountControl({
      draftValue: String(graphState.vertexCount),
      pendingValue: null,
      isConfirmOpen: false,
    });
  };

  const openClearConfirmation = () => {
    // Открытие очистки закрывает возможное подтверждение пересоздания графа.
    setVertexCountControl((currentState) => ({
      ...currentState,
      pendingValue: null,
      isConfirmOpen: false,
    }));
    setIsClearConfirmOpen(true);
  };

  const confirmClearGraph = () => {
    const nextVertexCount = graphState.vertexCount;

    setGraphState(reconstructGraphState(nextVertexCount));
    setVertexCountControl({
      draftValue: String(nextVertexCount),
      pendingValue: null,
      isConfirmOpen: false,
    });
    setIsClearConfirmOpen(false);
  };

  const cancelClearGraph = () => {
    setIsClearConfirmOpen(false);
  };

  const loadExampleGraph = () => {
    const exampleState = getExamplePreset();

    setGraphState(exampleState);
    setVertexCountControl({
      draftValue: String(exampleState.vertexCount),
      pendingValue: null,
      isConfirmOpen: false,
    });
    setIsClearConfirmOpen(false);
  };

  const undo = () => {
    setGraphState((currentState) => undoGraphState(currentState));
  };

  const redo = () => {
    setGraphState((currentState) => redoGraphState(currentState));
  };

  const toggleMatrixCell = (rowIndex: number, columnIndex: number) => {
    // Все изменения матрицы проходят через graph state layer, который сразу пересобирает список дуг.
    setGraphState((currentState) => applyMatrixToggle(currentState, rowIndex, columnIndex));
  };

  const handleNodeClick = (vertexId: VertexId) => {
    setGraphState((currentState) => {
      // Первый клик выбирает источник, второй клик завершает направленную дугу.
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
      // Во время создания дуги существующие дуги не выбираются.
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

  const applyMalgrangeResults = (componentResults: ComponentResult[]) => {
    setGraphState((currentState) => applyComponentResultsToState(currentState, componentResults));
  };

  const hoveredMatrixCell = useMemo(
    // Hover дуги подсвечивает соответствующую ячейку матрицы.
    () => getMatrixPositionByEdgeId(graphState.hoveredEdgeId, graphState.vertices),
    [graphState.hoveredEdgeId, graphState.vertices],
  );

  const selectedMatrixCell = useMemo(
    // Выбор дуги синхронизируется с выбранной ячейкой матрицы.
    () => getMatrixPositionByEdgeId(graphState.selectedEdgeId, graphState.vertices),
    [graphState.selectedEdgeId, graphState.vertices],
  );

  return {
    graphState,
    vertexCountControl,
    isClearConfirmOpen,
    hoveredMatrixCell,
    selectedMatrixCell,
    canUndo: graphState.history.past.length > 0,
    canRedo: graphState.history.future.length > 0,
    canLoadExample: EXAMPLE_PRESET_AVAILABLE,
    setVertexCountDraft,
    openVertexCountConfirmation,
    confirmVertexCountReconstruction,
    cancelVertexCountReconstruction,
    openClearConfirmation,
    confirmClearGraph,
    cancelClearGraph,
    loadExampleGraph,
    undo,
    redo,
    toggleMatrixCell,
    handleNodeClick,
    handleEdgeHover,
    handleEdgeSelect,
    cancelPendingEdgeCreation,
    deleteSelectedGraphEdge,
    applyMalgrangeResults,
  };
}

