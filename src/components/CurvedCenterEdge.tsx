import { BaseEdge, type EdgeProps } from '@xyflow/react';
import { getCurvedEdgeGeometry } from '../utils/edgeGeometry';
import type { CurvedEdgeRenderData } from './edgeRenderTypes';
import { getEdgeVariantStyle } from './edgeStyles';

export function CurvedCenterEdge({ data }: EdgeProps) {
  const edgeData = data as CurvedEdgeRenderData | undefined;

  if (!edgeData) {
    return null;
  }

  const style = getEdgeVariantStyle(edgeData.variant);
  const isInteractive = edgeData.isInteractive ?? style.isInteractive;
  const geometry = getCurvedEdgeGeometry(
    edgeData.sourceCenter,
    edgeData.targetCenter,
    edgeData.bendDirection,
  );

  return (
    <g
      style={{
        pointerEvents: isInteractive ? style.pointerEvents : 'none',
        opacity: style.opacity,
      }}
    >
      <BaseEdge
        path={geometry.curvePath}
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
          d={geometry.curvePath}
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
