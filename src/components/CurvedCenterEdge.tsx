import { BaseEdge, type EdgeProps } from '@xyflow/react';
import { getCurvedEdgeGeometry } from '../utils/edgeGeometry';
import type { CurvedEdgeRenderData } from './edgeRenderTypes';
import { getEdgeVariantStyle } from './edgeStyles';

export function CurvedCenterEdge({ id, data }: EdgeProps) {
  const edgeData = data as CurvedEdgeRenderData | undefined;

  // Без данных о центрах вершин React Flow edge не имеет собственной геометрии.
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
  // Направление изгиба задаётся на уровне GraphCanvas для встречных дуг.
  const geometry = getCurvedEdgeGeometry(
    edgeData.sourceCenter,
    edgeData.targetCenter,
    edgeData.bendDirection,
  );

  return (
    <g
      className={edgeClassName}
      data-testid={`graph-edge-${id.replace('->', '-')}`}
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
        // Hitbox отделён от видимого пути, чтобы не утолщать саму дугу.
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

