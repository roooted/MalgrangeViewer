import type { AdjacencyMatrix as MatrixData, Vertex } from '../model/types';

type AdjacencyMatrixProps = {
  vertices: Vertex[];
  matrix: MatrixData;
  onToggleCell: (rowIndex: number, columnIndex: number) => void;
};

export function AdjacencyMatrix({ vertices, matrix, onToggleCell }: AdjacencyMatrixProps) {
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

                {row.map((value, columnIndex) => (
                  <td key={`${rowIndex}-${columnIndex}`}>
                    <button
                      aria-label={`Toggle edge ${vertices[rowIndex]?.label} to ${vertices[columnIndex]?.label}`}
                      className={`matrix__cell${rowIndex === columnIndex ? ' matrix__cell--diagonal' : ''}${value === 1 ? ' matrix__cell--active' : ''}`}
                      type="button"
                      onClick={() => onToggleCell(rowIndex, columnIndex)}
                    >
                      {value}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
