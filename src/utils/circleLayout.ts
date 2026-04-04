import type { Vertex } from '../model/types';

type Position = {
  x: number;
  y: number;
};

type CircleLayoutItem = {
  id: Vertex['id'];
  label: Vertex['label'];
  position: Position;
};

const LAYOUT_CENTER_X = 360;
const LAYOUT_CENTER_Y = 260;
const LAYOUT_RADIUS = 190;

// Равномерно раскладываем вершины по окружности, чтобы каркас сразу соответствовал ТЗ.
export const createCircleLayout = (vertices: Vertex[]): CircleLayoutItem[] =>
  vertices.map((vertex, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(vertices.length, 1);

    return {
      id: vertex.id,
      label: vertex.label,
      position: {
        x: LAYOUT_CENTER_X + LAYOUT_RADIUS * Math.cos(angle),
        y: LAYOUT_CENTER_Y + LAYOUT_RADIUS * Math.sin(angle),
      },
    };
  });
