import { AdjacencyMatrix } from '../components/AdjacencyMatrix';
import { ConfirmModal } from '../components/ConfirmModal';
import { ControlPanel } from '../components/ControlPanel';
import { GraphCanvas } from '../components/GraphCanvas';
import { ResultPanel } from '../components/ResultPanel';
import { useGraphEditor } from '../hooks/useGraphEditor';
import { useMalgrange } from '../hooks/useMalgrange';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { MAX_VERTEX_COUNT, MIN_VERTEX_COUNT } from '../model/graphState';

function App() {
  const editor = useGraphEditor();
  const undoRedo = useUndoRedo(editor.graphState.history);
  const malgrange = useMalgrange(editor.graphState);

  return (
    <div className="app-shell">
      <header className="panel app-toolbar">
        <div className="brand">
          <span className="brand__eyebrow">Directed Graph Workspace</span>
          <h1 className="brand__title">Malgrange Graph Visualizer</h1>
          <p className="brand__description">
            Edit the graph through the adjacency matrix. Algorithm and mouse edge editing are kept
            for the next stages.
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
              Vertices are reconstructed on a circle, and matrix toggles immediately update visible
              directed edges.
            </p>
          </div>

          <div className="workspace__graph-body">
            <GraphCanvas vertices={editor.graphState.vertices} edges={editor.graphState.edges} />
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
