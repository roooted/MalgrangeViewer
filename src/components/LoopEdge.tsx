import { BaseEdge, type EdgeProps } from '@xyflow/react';
import { getLoopEdgeGeometry } from '../utils/edgeGeometry';
import type { EdgeRenderData } from './edgeRenderTypes';
import { getEdgeVariantStyle } from './edgeStyles';

export function LoopEdge({ data }: EdgeProps) {
  const edgeData = data as EdgeRenderData | undefined;

  if (!edgeData) {
    return null;
  }

  const style = getEdgeVariantStyle(edgeData.variant, edgeData.componentColor);
  const isInteractive = edgeData.isInteractive ?? style.isInteractive;
  const geometry = getLoopEdgeGeometry(edgeData.sourceCenter);

  return (
    <g
      style={{
        pointerEvents: isInteractive ? style.pointerEvents : 'none',
        opacity: style.opacity,
      }}
    >
      <BaseEdge
        path={geometry.loopPath}
        style={{
          stroke: style.color,
          strokeWidth: style.strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeDasharray: style.dasharray,
          pointerEvents: 'none',
        }}
      />
      {isInteractive ? (
        <path
          d={geometry.loopPath}
          fill="none"
          stroke="transparent"
          strokeWidth={style.hitboxWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: 'stroke' }}
        />
      ) : null}
      <path d={geometry.arrowPath} fill={style.color} style={{ pointerEvents: 'none' }} />
    </g>
  );
}

