import { useEffect, useMemo, type CSSProperties } from 'react';
import '../../components/ControlPanel/ControlPanel.module.css';
import { AdjacencyMatrix } from '../../components/AdjacencyMatrix/AdjacencyMatrix';
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { ControlPanel } from '../../components/ControlPanel/ControlPanel';
import { GraphCanvas } from '../../components/GraphCanvas/GraphCanvas';
import { ResultPanel } from '../../components/ResultPanel/ResultPanel';
import { useGraphEditor } from '../../hooks/useGraphEditor';
import { useMalgrange } from '../../hooks/useMalgrange';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import {
  MAX_VERTEX_COUNT,
  MIN_VERTEX_COUNT,
  createComponentColorMaps,
} from '../../model/graphState';
import { getMatrixPositionByEdgeId } from '../../utils/matrixMapping';
import { MATRIX_CELL_GAP_PX, MATRIX_CELL_SIZE_PX } from '../../utils/uiConstants';
import './App.module.css';

type AppCssVariables = CSSProperties & {
  '--matrix-cell-gap': string;
  '--matrix-cell-size': string;
};

function App() {
  const editor = useGraphEditor();
  const undoRedo = useUndoRedo(editor.graphState.history, editor.undo, editor.redo);
  const { canUndo, canRedo, undo, redo } = undoRedo;
  const malgrange = useMalgrange(editor.graphState, editor.applyMalgrangeResults);
  const appStyle: AppCssVariables = {
    '--matrix-cell-gap': `${MATRIX_CELL_GAP_PX}px`,
    '--matrix-cell-size': `${MATRIX_CELL_SIZE_PX}px`,
  };
  const isAnyConfirmOpen = editor.vertexCountControl.isConfirmOpen || editor.isClearConfirmOpen;

  const componentColorMaps = useMemo(
    () => createComponentColorMaps(editor.graphState.componentResults),
    [editor.graphState.componentResults],
  );

  const componentCellColorByKey = useMemo(() => {
    const colorMap: Record<string, string> = {};

    editor.graphState.componentResults.forEach((component) => {
      component.edgeIds.forEach((edgeId) => {
        const matrixPosition = getMatrixPositionByEdgeId(edgeId, editor.graphState.vertices);

        if (!matrixPosition) {
          return;
        }

        colorMap[`${matrixPosition.rowIndex}-${matrixPosition.columnIndex}`] = component.color;
      });
    });

    return colorMap;
  }, [editor.graphState.componentResults, editor.graphState.vertices]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAnyConfirmOpen) {
        return;
      }

      const lowerKey = event.key.toLowerCase();

      if (event.ctrlKey && (lowerKey === 'z' || lowerKey === 'я') && canUndo) {
        event.preventDefault();
        undo();
        return;
      }

      if (event.ctrlKey && (lowerKey === 'y' || lowerKey === 'н') && canRedo) {
        event.preventDefault();
        redo();
        return;
      }

      if (event.key === 'Escape' && editor.graphState.pendingEdgeSourceId !== null) {
        event.preventDefault();
        editor.cancelPendingEdgeCreation();
        return;
      }

      if (event.key === 'Delete' && editor.graphState.selectedEdgeId !== null) {
        event.preventDefault();
        editor.deleteSelectedGraphEdge();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    editor.cancelPendingEdgeCreation,
    editor.deleteSelectedGraphEdge,
    editor.graphState.pendingEdgeSourceId,
    editor.graphState.selectedEdgeId,
    isAnyConfirmOpen,
    canUndo,
    canRedo,
    undo,
    redo,
  ]);

  return (
    <div className="app-shell" style={appStyle}>
      <main className="workspace">
        <section className="workspace__column workspace__column--left">
          <header className="panel app-toolbar">
            <div className="brand">
              <span className="brand__eyebrow">Directed Graph Workspace</span>
              <h1 className="brand__title">Malgrange Graph Visualizer</h1>
              <p className="brand__description">
                Edit directed edges on the graph and in the adjacency matrix, then run Malgrange SCC
                detection on the current graph.
              </p>
            </div>

            <ControlPanel
              vertexCountValue={editor.vertexCountControl.draftValue}
              minVertexCount={MIN_VERTEX_COUNT}
              maxVertexCount={MAX_VERTEX_COUNT}
              canLoadExample={editor.canLoadExample}
              canFindComponents={malgrange.canRun}
              onVertexCountChange={editor.setVertexCountDraft}
              onApplyVertexCount={editor.openVertexCountConfirmation}
              onLoadExample={editor.loadExampleGraph}
              onClear={editor.openClearConfirmation}
              onFindComponents={malgrange.run}
            />
          </header>

          <section className="panel workspace__graph">
            <div className="panel__header">
              <span className="panel__eyebrow">Graph</span>
              <h2 className="panel__title">Directed graph canvas</h2>
              <p className="panel__description">
                Click a vertex to start edge creation. Press Esc to cancel, or select an edge and
                press Delete to remove it.
              </p>
            </div>

            <div className="workspace__graph-body">
              <GraphCanvas
                vertices={editor.graphState.vertices}
                edges={editor.graphState.edges}
                pendingEdgeSourceId={editor.graphState.pendingEdgeSourceId}
                hoveredEdgeId={editor.graphState.hoveredEdgeId}
                selectedEdgeId={editor.graphState.selectedEdgeId}
                vertexColorById={componentColorMaps.vertexColorById}
                edgeColorById={componentColorMaps.edgeColorById}
                onNodeClick={editor.handleNodeClick}
                onEdgeHover={editor.handleEdgeHover}
                onEdgeSelect={editor.handleEdgeSelect}
              />

              <div className="graph-history-controls">
                <button className="icon-button" type="button" onClick={undo} disabled={!canUndo}>
                  {'<'}
                </button>
                <button className="icon-button" type="button" onClick={redo} disabled={!canRedo}>
                  {'>'}
                </button>
              </div>
            </div>
          </section>
        </section>

        <section className="workspace__column workspace__column--right">
          <section className="panel workspace__matrix">
            <div className="panel__header">
              <span className="panel__eyebrow">Matrix</span>
              <h2 className="panel__title">Adjacency matrix</h2>
              <p className="panel__description">
                Click any cell to toggle a directed edge. Diagonal cells control loops.
              </p>
            </div>

            <AdjacencyMatrix
              vertices={editor.graphState.vertices}
              matrix={editor.graphState.matrix}
              hoveredCell={editor.hoveredMatrixCell}
              selectedCell={editor.selectedMatrixCell}
              componentCellColorByKey={componentCellColorByKey}
              onToggleCell={editor.toggleMatrixCell}
            />
          </section>

          <section className="panel workspace__results">
            <div className="panel__header">
              <span className="panel__eyebrow">Results</span>
              <h2 className="panel__title">Strongly connected components</h2>
              <p className="panel__description">
                Click Find Components to run the standard Malgrange algorithm on the current graph.
              </p>
            </div>

            <ResultPanel results={malgrange.results} />
          </section>
        </section>
      </main>

      <ConfirmModal
        isOpen={editor.vertexCountControl.isConfirmOpen && editor.vertexCountControl.pendingValue !== null}
        title="Reconstruct current graph?"
        description={`Confirm reconstruction with ${editor.vertexCountControl.pendingValue ?? editor.graphState.vertexCount} isolated vertices. Current edges and undo/redo history will be cleared.`}
        onConfirm={editor.confirmVertexCountReconstruction}
        onCancel={editor.cancelVertexCountReconstruction}
      />

      <ConfirmModal
        isOpen={editor.isClearConfirmOpen}
        title="Clear current graph?"
        description="Confirm clearing the current graph. All edges and undo/redo history will be removed."
        onConfirm={editor.confirmClearGraph}
        onCancel={editor.cancelClearGraph}
      />
    </div>
  );
}

export default App;





