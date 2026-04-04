import type { KeyboardEvent } from 'react';

type ControlPanelProps = {
  vertexCountValue: string;
  minVertexCount: number;
  maxVertexCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onVertexCountChange: (value: string) => void;
  onVertexCountCommit: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

export function ControlPanel({
  vertexCountValue,
  minVertexCount,
  maxVertexCount,
  canUndo,
  canRedo,
  onVertexCountChange,
  onVertexCountCommit,
  onUndo,
  onRedo,
}: ControlPanelProps) {
  const handleVertexCountKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onVertexCountCommit();
    }
  };

  return (
    <div className="control-panel">
      <div className="control-panel__group">
        <label className="control-panel__field">
          <span className="control-panel__label">Vertices</span>
          <input
            className="control-panel__input"
            type="number"
            min={minVertexCount}
            max={maxVertexCount}
            value={vertexCountValue}
            onChange={(event) => onVertexCountChange(event.target.value)}
            onBlur={onVertexCountCommit}
            onKeyDown={handleVertexCountKeyDown}
          />
        </label>
      </div>

      <div className="control-panel__group">
        <button className="icon-button" type="button" onClick={onUndo} disabled={!canUndo}>
          {'<'}
        </button>
        <button className="icon-button" type="button" onClick={onRedo} disabled={!canRedo}>
          {'>'}
        </button>
      </div>

      <div className="control-panel__group">
        <button className="button" type="button" disabled>
          Example
        </button>
        <button className="button" type="button" disabled>
          Clear
        </button>
        <button className="button button--primary" type="button" disabled>
          Find Components
        </button>
      </div>
    </div>
  );
}
