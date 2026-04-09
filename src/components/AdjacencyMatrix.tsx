import type { AdjacencyMatrix as MatrixData, Vertex } from '../model/types';
import type { MatrixCellPosition } from '../utils/matrixMapping';

type AdjacencyMatrixProps = {
  vertices: Vertex[];
  matrix: MatrixData;
  hoveredCell: MatrixCellPosition | null;
  selectedCell: MatrixCellPosition | null;
  onToggleCell: (rowIndex: number, columnIndex: number) => void;
};

export function AdjacencyMatrix({
  vertices,
  matrix,
  hoveredCell,
  selectedCell,
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

                  return (
                    <td key={`${rowIndex}-${columnIndex}`}>
                      <button
                        aria-label={`Toggle edge ${vertices[rowIndex]?.label} to ${vertices[columnIndex]?.label}`}
                        className={`matrix__cell${isDiagonal ? ' matrix__cell--diagonal' : ''}${isActive ? ' matrix__cell--active' : ''}${isHovered ? ' matrix__cell--hovered' : ''}${isSelected ? ' matrix__cell--selected' : ''}`}
                        type="button"
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

