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

export const GRAPH_CENTER_X = 360;
export const GRAPH_CENTER_Y = 260;
export const GRAPH_LAYOUT_RADIUS = 190;
export const GRAPH_NODE_DIAMETER = 48;
export const GRAPH_NODE_RADIUS = GRAPH_NODE_DIAMETER / 2;

// Равномерно раскладываем вершины по окружности, чтобы каркас сразу соответствовал ТЗ.
export const createCircleLayout = (vertices: Vertex[]): CircleLayoutItem[] =>
  vertices.map((vertex, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(vertices.length, 1);

    return {
      id: vertex.id,
      label: vertex.label,
      position: {
        x: GRAPH_CENTER_X + GRAPH_LAYOUT_RADIUS * Math.cos(angle),
        y: GRAPH_CENTER_Y + GRAPH_LAYOUT_RADIUS * Math.sin(angle),
      },
    };
  });
