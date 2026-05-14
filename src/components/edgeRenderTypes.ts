import type { EdgeRenderPosition } from '../utils/edgeGeometry';

// Вариант задаёт визуальное состояние дуги независимо от её доменного типа.
export type EdgeVisualVariant = 'normal' | 'hovered' | 'selected' | 'temporary';

export type EdgeRenderData = {
  // Renderer получает уже рассчитанные центры, чтобы не зависеть от DOM-измерений.
  sourceCenter: EdgeRenderPosition;
  targetCenter: EdgeRenderPosition;
  variant: EdgeVisualVariant;
  componentColor?: string;
  isComponentHighlighted?: boolean;
  isComponentDimmed?: boolean;
  isInteractive?: boolean;
};

export type CurvedEdgeRenderData = EdgeRenderData & {
  bendDirection: 1 | -1;
};

