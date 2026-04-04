import type { AdjacencyMatrix as MatrixData, Vertex } from '../model/types';

type AdjacencyMatrixProps = {
  vertices: Vertex[];
  matrix: MatrixData;
};

export function AdjacencyMatrix({ vertices, matrix }: AdjacencyMatrixProps) {
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
                    <button className="matrix__cell" type="button" disabled>
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
