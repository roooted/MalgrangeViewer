import type { ComponentResult } from '../model/types';

type ResultPanelProps = {
  results: ComponentResult[];
};

export function ResultPanel({ results }: ResultPanelProps) {
  if (results.length === 0) {
    return (
      <div className="result-panel">
        <div className="result-panel__empty">
          No components calculated yet. Enable the algorithm in the next stage to populate this
          panel.
        </div>
      </div>
    );
  }

  return (
    <div className="result-panel">
      <ul className="result-panel__list">
        {results.map((result, index) => (
          <li
            className="result-panel__item"
            key={result.id}
            style={{ borderColor: result.color, boxShadow: `inset 0 0 0 1px ${result.color}33` }}
          >
            <div className="result-panel__item-title">Component {index + 1}</div>
            <div className="result-panel__item-values">{result.vertexIds.join(', ')}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
