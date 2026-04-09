import { useEffect, type CSSProperties } from 'react';
import { AdjacencyMatrix } from '../components/AdjacencyMatrix';
import { ConfirmModal } from '../components/ConfirmModal';
import { ControlPanel } from '../components/ControlPanel';
import { GraphCanvas } from '../components/GraphCanvas';
import { ResultPanel } from '../components/ResultPanel';
import { useGraphEditor } from '../hooks/useGraphEditor';
import { useMalgrange } from '../hooks/useMalgrange';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { MAX_VERTEX_COUNT, MIN_VERTEX_COUNT } from '../model/graphState';
import { MATRIX_CELL_SIZE_PX } from '../utils/uiConstants';

type AppCssVariables = CSSProperties & {
  '--matrix-cell-size': string;
};

function App() {
  const editor = useGraphEditor();
  const undoRedo = useUndoRedo(editor.graphState.history);
  const malgrange = useMalgrange(editor.graphState);
  const appStyle: AppCssVariables = {
    '--matrix-cell-size': `${MATRIX_CELL_SIZE_PX}px`,
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editor.vertexCountControl.isConfirmOpen) {
        return;
      }

      if (event.key === 'Escape' && editor.graphState.pendingEdgeSourceId !== null) {
        event.preventDefault();
        editor.cancelPendingEdgeCreation();
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
    editor.vertexCountControl.isConfirmOpen,
  ]);

  return (
    <div className="app-shell" style={appStyle}>
      <header className="panel app-toolbar">
        <div className="brand">
          <span className="brand__eyebrow">Directed Graph Workspace</span>
          <h1 className="brand__title">Malgrange Graph Visualizer</h1>
          <p className="brand__description">
            Edit directed edges on the graph and through the adjacency matrix. SCC calculation is
            prepared and will be enabled in the next stage.
          </p>
        </div>

        <ControlPanel
          vertexCountValue={editor.vertexCountControl.draftValue}
          minVertexCount={MIN_VERTEX_COUNT}
          maxVertexCount={MAX_VERTEX_COUNT}
          canUndo={undoRedo.canUndo}
          canRedo={undoRedo.canRedo}
          onVertexCountChange={editor.setVertexCountDraft}
          onApplyVertexCount={editor.openVertexCountConfirmation}
          onUndo={undoRedo.undo}
          onRedo={undoRedo.redo}
        />
      </header>

      <main className="workspace">
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
              onNodeClick={editor.handleNodeClick}
              onEdgeHover={editor.handleEdgeHover}
              onEdgeSelect={editor.handleEdgeSelect}
            />
          </div>
        </section>

        <div className="workspace__side">
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
              onToggleCell={editor.toggleMatrixCell}
            />
          </section>

          <section className="panel workspace__results">
            <div className="panel__header">
              <span className="panel__eyebrow">Results</span>
              <h2 className="panel__title">Strongly connected components</h2>
              <p className="panel__description">
                The Malgrange algorithm panel is prepared and will be activated in the next stage.
              </p>
            </div>

            <ResultPanel results={malgrange.results} />
          </section>
        </div>
      </main>

      <ConfirmModal
        isOpen={editor.vertexCountControl.isConfirmOpen}
        pendingVertexCount={editor.vertexCountControl.pendingValue}
        onConfirm={editor.confirmVertexCountReconstruction}
        onCancel={editor.cancelVertexCountReconstruction}
      />
    </div>
  );
}

export default App;
