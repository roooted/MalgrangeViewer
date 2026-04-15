import type { CSSProperties } from 'react';
import type { ComponentResult } from '../model/types';
import { COMPONENT_RESULT_STROKE_COLOR, getComponentFillOpacityByColor, hexToRgba } from '../utils/colors';

type ResultPanelProps = {
  results: ComponentResult[];
};

type ResultItemStyle = CSSProperties & {
  '--component-fill'?: string;
};

export function ResultPanel({ results }: ResultPanelProps) {
  if (results.length === 0) {
    return (
      <div className="result-panel">
        <div className="result-panel__empty">
          No components calculated yet. Click Find Components to run the Malgrange algorithm.
        </div>
      </div>
    );
  }

  const splitIndex = Math.ceil(results.length / 2);
  const leftColumn = results.slice(0, splitIndex);
  const rightColumn = results.slice(splitIndex);

  const renderResultItem = (result: ComponentResult, index: number) => {
    const itemStyle: ResultItemStyle = {
      '--component-fill': hexToRgba(result.color, getComponentFillOpacityByColor(result.color)),
      borderColor: COMPONENT_RESULT_STROKE_COLOR,
    };

    return (
      <li className="result-panel__item result-panel__item--component" key={result.id} style={itemStyle}>
        <div className="result-panel__item-title">Component {index + 1}</div>
        <div className="result-panel__item-values">{result.vertexIds.join(', ')}</div>
      </li>
    );
  };

  return (
    <div className="result-panel">
      <div className="result-panel__columns">
        <ul className="result-panel__column">
          {leftColumn.map((result, index) => renderResultItem(result, index))}
        </ul>

        <ul className="result-panel__column">
          {rightColumn.map((result, index) => renderResultItem(result, splitIndex + index))}
        </ul>
      </div>
    </div>
  );
}
