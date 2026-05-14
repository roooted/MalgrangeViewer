import type { CSSProperties } from 'react';
import type { ComponentResult } from '../../model/types';
import { COMPONENT_RESULT_STROKE_COLOR, getComponentFillOpacityByColor, hexToRgba } from '../../utils/colors';
import './ResultPanel.module.css';

type ResultPanelProps = {
  results: ComponentResult[];
  hoveredComponentId: string | null;
  onComponentHover: (componentId: string | null) => void;
};

type ResultItemStyle = CSSProperties & {
  '--component-fill'?: string;
};

type ResultListStyle = CSSProperties & {
  '--result-column-min'?: string;
};

export function ResultPanel({ results, hoveredComponentId, onComponentHover }: ResultPanelProps) {
  // Пустое состояние показывается до первого ручного запуска алгоритма.
  if (results.length === 0) {
    return (
      <div className="result-panel" data-testid="result-panel">
        <div className="result-panel__empty">
          No components calculated yet. Click Find Components to run the Malgrange algorithm.
        </div>
      </div>
    );
  }

  // Ширина колонки подстраивается под самый длинный список вершин.
  const longestValuesLength = results.reduce((maxLength, result) => {
    return Math.max(maxLength, result.vertexIds.join(', ').length);
  }, 0);
  const listStyle: ResultListStyle = {
    '--result-column-min': `${Math.min(Math.max(longestValuesLength + 4, 10), 24)}ch`,
  };

  const renderResultItem = (result: ComponentResult, index: number) => {
    // Наведённая компонента остаётся яркой, остальные временно приглушаются.
    const isComponentHoverActive = hoveredComponentId !== null;
    const isHovered = hoveredComponentId === result.id;
    const itemClassName = `result-panel__item result-panel__item--component${isHovered ? ' result-panel__item--highlighted' : ''}${isComponentHoverActive && !isHovered ? ' result-panel__item--dimmed' : ''}`;
    const itemStyle: ResultItemStyle = {
      '--component-fill': hexToRgba(result.color, getComponentFillOpacityByColor(result.color)),
      borderColor: COMPONENT_RESULT_STROKE_COLOR,
    };

    return (
      <li
        className={itemClassName}
        data-testid={`result-component-${result.id}`}
        key={result.id}
        style={itemStyle}
        tabIndex={0}
        onBlur={() => onComponentHover(null)}
        onFocus={() => onComponentHover(result.id)}
        onMouseEnter={() => onComponentHover(result.id)}
        onMouseLeave={() => onComponentHover(null)}
      >
        <div className="result-panel__item-title">Component {index + 1}</div>
        <div className="result-panel__item-values">{result.vertexIds.join(', ')}</div>
      </li>
    );
  };

  return (
    <div className="result-panel" data-testid="result-panel">
      <div className="result-panel__columns">
        <ul className="result-panel__column" style={listStyle}>
          {results.map((result, index) => renderResultItem(result, index))}
        </ul>
      </div>
    </div>
  );
}


