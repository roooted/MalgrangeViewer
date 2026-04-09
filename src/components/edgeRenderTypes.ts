import type { EdgeRenderPosition } from '../utils/edgeGeometry';

export type EdgeVisualVariant = 'normal' | 'hovered' | 'selected' | 'temporary';

export type EdgeRenderData = {
  sourceCenter: EdgeRenderPosition;
  targetCenter: EdgeRenderPosition;
  variant: EdgeVisualVariant;
  isInteractive?: boolean;
};

export type CurvedEdgeRenderData = EdgeRenderData & {
  bendDirection: 1 | -1;
};
