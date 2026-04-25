import type { CSSProperties } from 'react';
import type { AdjacencyMatrix as MatrixData, Vertex } from '../../model/types';
import type { MatrixCellPosition } from '../../utils/matrixMapping';
import { COMPONENT_MATRIX_STROKE_COLOR, getComponentFillOpacityByColor, hexToRgba } from '../../utils/colors';
import './AdjacencyMatrix.module.css';

type AdjacencyMatrixProps = {
  vertices: Vertex[];
  matrix: MatrixData;
  hoveredCell: MatrixCellPosition | null;
  selectedCell: MatrixCellPosition | null;
  componentCellColorByKey: Record<string, string>;
  onToggleCell: (rowIndex: number, columnIndex: number) => void;
};

type MatrixCellStyleWithVariable = CSSProperties & {
  '--matrix-component-color'?: string;
  '--matrix-component-fill'?: string;
};

export function AdjacencyMatrix({
  vertices,
  matrix,
  hoveredCell,
  selectedCell,
  componentCellColorByKey,
  onToggleCell,
}: AdjacencyMatrixProps) {
  return (
    <div className="matrix">
      <div className="matrix__scroll">
        <table className="matrix__table">
          <thead>
            <tr>
              <th className="matrix__corner" />
              {vertices.map((vertex) => (
                <th className="matrix__header" key={`column-${vertex.id}`} scope="col">
                  {vertex.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={`row-${vertices[rowIndex]?.id ?? rowIndex}`}>
                <th className="matrix__header" scope="row">
                  {vertices[rowIndex]?.label}
                </th>

                {row.map((value, columnIndex) => {
                  const isDiagonal = rowIndex === columnIndex;
                  const isActive = value === 1;
                  const isHovered =
                    hoveredCell?.rowIndex === rowIndex && hoveredCell?.columnIndex === columnIndex;
                  const isSelected =
                    selectedCell?.rowIndex === rowIndex && selectedCell?.columnIndex === columnIndex;
                  const componentColor = componentCellColorByKey[`${rowIndex}-${columnIndex}`];
                  const hasComponentColor = Boolean(componentColor && isActive);
                  const cellStyle: MatrixCellStyleWithVariable | undefined = hasComponentColor
                    ? {
                        '--matrix-component-color': componentColor,
                        '--matrix-component-fill': hexToRgba(
                          componentColor,
                          getComponentFillOpacityByColor(componentColor),
                        ),
                        borderColor: COMPONENT_MATRIX_STROKE_COLOR,
                      }
                    : undefined;

                  return (
                    <td key={`${rowIndex}-${columnIndex}`}>
                      <button
                        aria-label={`Toggle edge ${vertices[rowIndex]?.label} to ${vertices[columnIndex]?.label}`}
                        className={`matrix__cell${isDiagonal ? ' matrix__cell--diagonal' : ''}${isActive ? ' matrix__cell--active' : ''}${hasComponentColor ? ' matrix__cell--component' : ''}${isHovered ? ' matrix__cell--hovered' : ''}${isSelected ? ' matrix__cell--selected' : ''}`}
                        type="button"
                        style={cellStyle}
                        onClick={() => onToggleCell(rowIndex, columnIndex)}
                      >
                        {value}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


