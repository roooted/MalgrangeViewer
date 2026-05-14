import { BaseEdge, type EdgeProps } from '@xyflow/react';
import {
  getStraightEdgeGeometry,
  getTemporaryStraightEdgeGeometry,
} from '../utils/edgeGeometry';
import type { EdgeRenderData } from './edgeRenderTypes';
import { getEdgeVariantStyle } from './edgeStyles';

export function StraightCenterEdge({ id, data }: EdgeProps) {
  const edgeData = data as EdgeRenderData | undefined;

  // React Flow может вызвать renderer без доменных данных, тогда ничего не рисуем.
  if (!edgeData) {
    return null;
  }

  const style = getEdgeVariantStyle(
    edgeData.variant,
    edgeData.componentColor,
    edgeData.isComponentHighlighted,
    edgeData.isComponentDimmed,
  );
  const isInteractive = edgeData.isInteractive ?? style.isInteractive;
  const edgeClassName = `graph-edge${edgeData.isComponentHighlighted ? ' graph-edge--component-highlighted' : ''}${edgeData.isComponentDimmed ? ' graph-edge--component-dimmed' : ''}`;
  // Временная дуга использует отдельную геометрию, потому что её цель следует за курсором.
  const geometry =
    edgeData.variant === 'temporary'
      ? getTemporaryStraightEdgeGeometry(edgeData.sourceCenter, edgeData.targetCenter)
      : getStraightEdgeGeometry(edgeData.sourceCenter, edgeData.targetCenter);

  return (
    <g
      className={edgeClassName}
      data-testid={edgeData.variant === 'temporary' ? undefined : `graph-edge-${id.replace('->', '-')}`}
      style={{
        pointerEvents: isInteractive ? style.pointerEvents : 'none',
        opacity: style.opacity,
      }}
    >
      <BaseEdge
        path={geometry.linePath}
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
        // Невидимый широкий путь облегчает выбор тонкой дуги мышью.
        <path
          d={geometry.linePath}
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

