import { BaseEdge, type EdgeProps } from '@xyflow/react';
import { EDGE_BASE_COLOR, EDGE_STROKE_WIDTH } from '../utils/colors';
import { getStraightEdgeGeometry, type EdgeRenderPosition } from '../utils/edgeGeometry';

type EdgeRenderData = {
  sourceCenter: EdgeRenderPosition;
  targetCenter: EdgeRenderPosition;
};

export function StraightCenterEdge({ data }: EdgeProps) {
  const edgeData = data as EdgeRenderData | undefined;

  if (!edgeData) {
    return null;
  }

  const geometry = getStraightEdgeGeometry(edgeData.sourceCenter, edgeData.targetCenter);

  return (
    <g>
      <BaseEdge
        path={geometry.linePath}
        style={{
          stroke: EDGE_BASE_COLOR,
          strokeWidth: EDGE_STROKE_WIDTH,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      />
      <path d={geometry.arrowPath} fill={EDGE_BASE_COLOR} />
    </g>
  );
}
