import {
  EDGE_BASE_COLOR,
  EDGE_HITBOX_WIDTH,
  EDGE_HOVER_COLOR,
  EDGE_SELECTED_COLOR,
  EDGE_SELECTED_DASHARRAY,
  EDGE_STROKE_WIDTH,
  EDGE_TEMPORARY_COLOR,
  EDGE_TEMPORARY_DASHARRAY,
} from '../utils/colors';
import type { EdgeVisualVariant } from './edgeRenderTypes';

type EdgeVariantStyle = {
  color: string;
  strokeWidth: number;
  dasharray?: string;
  pointerEvents: 'auto' | 'none';
  opacity: number;
  hitboxWidth: number;
  isInteractive: boolean;
};

export const getEdgeVariantStyle = (
  variant: EdgeVisualVariant,
  componentColor?: string,
  isComponentHighlighted = false,
  isComponentDimmed = false,
): EdgeVariantStyle => {
  // Hover имеет приоритет над компонентной окраской.
  if (variant === 'hovered') {
    return {
      color: EDGE_HOVER_COLOR,
      strokeWidth: EDGE_STROKE_WIDTH + 0.35,
      pointerEvents: 'auto',
      opacity: 1,
      hitboxWidth: EDGE_HITBOX_WIDTH,
      isInteractive: true,
    };
  }

  // Выбранная дуга становится пунктирной по требованиям макета.
  if (variant === 'selected') {
    return {
      color: EDGE_SELECTED_COLOR,
      strokeWidth: EDGE_STROKE_WIDTH + 0.25,
      dasharray: EDGE_SELECTED_DASHARRAY,
      pointerEvents: 'auto',
      opacity: 1,
      hitboxWidth: EDGE_HITBOX_WIDTH,
      isInteractive: true,
    };
  }

  // Временная дуга не должна перехватывать события мыши.
  if (variant === 'temporary') {
    return {
      color: EDGE_TEMPORARY_COLOR,
      strokeWidth: EDGE_STROKE_WIDTH,
      dasharray: EDGE_TEMPORARY_DASHARRAY,
      pointerEvents: 'none',
      opacity: 0.96,
      hitboxWidth: 0,
      isInteractive: false,
    };
  }

  // Подсветка результата усиливает только дуги наведённой компоненты.
  if (isComponentHighlighted) {
    return {
      color: componentColor ?? EDGE_BASE_COLOR,
      strokeWidth: EDGE_STROKE_WIDTH + 0.55,
      pointerEvents: 'auto',
      opacity: 1,
      hitboxWidth: EDGE_HITBOX_WIDTH,
      isInteractive: true,
    };
  }

  // Обычная дуга может быть приглушена при наведении на другую компоненту.
  return {
    color: componentColor ?? EDGE_BASE_COLOR,
    strokeWidth: EDGE_STROKE_WIDTH,
    pointerEvents: 'auto',
    opacity: isComponentDimmed ? 0.24 : 1,
    hitboxWidth: EDGE_HITBOX_WIDTH,
    isInteractive: true,
  };
};

