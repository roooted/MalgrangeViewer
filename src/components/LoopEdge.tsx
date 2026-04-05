import { BaseEdge, type EdgeProps } from '@xyflow/react';
import { EDGE_BASE_COLOR, EDGE_STROKE_WIDTH } from '../utils/colors';
import { getLoopEdgeGeometry, type EdgeRenderPosition } from '../utils/edgeGeometry';

type EdgeRenderData = {
  sourceCenter: EdgeRenderPosition;
};

export function LoopEdge({ data }: EdgeProps) {
  const edgeData = data as EdgeRenderData | undefined;

  if (!edgeData) {
    return null;
  }

  const geometry = getLoopEdgeGeometry(edgeData.sourceCenter);

  return (
    <g>
      <BaseEdge
        path={geometry.loopPath}
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
