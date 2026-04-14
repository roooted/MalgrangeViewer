import type { KeyboardEvent } from 'react';

type ControlPanelProps = {
  vertexCountValue: string;
  minVertexCount: number;
  maxVertexCount: number;
  canLoadExample: boolean;
  onVertexCountChange: (value: string) => void;
  onApplyVertexCount: () => void;
  onLoadExample: () => void;
  onClear: () => void;
};

export function ControlPanel({
  vertexCountValue,
  minVertexCount,
  maxVertexCount,
  canLoadExample,
  onVertexCountChange,
  onApplyVertexCount,
  onLoadExample,
  onClear,
}: ControlPanelProps) {
  const handleVertexCountKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onApplyVertexCount();
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
            onKeyDown={handleVertexCountKeyDown}
          />
        </label>
        <button className="button" type="button" onClick={onApplyVertexCount}>
          Apply
        </button>
      </div>

      <div className="control-panel__group">
        <button className="button" type="button" disabled={!canLoadExample} onClick={onLoadExample}>
          Example
        </button>
        <button className="button" type="button" onClick={onClear}>
          Clear
        </button>
        <button className="button button--primary" type="button" disabled>
          Find Components
        </button>
      </div>
    </div>
  );
}
