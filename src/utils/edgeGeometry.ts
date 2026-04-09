import { GRAPH_CENTER_X, GRAPH_CENTER_Y, GRAPH_NODE_RADIUS } from './circleLayout';
import { EDGE_MUTUAL_MAX_CURVE_OFFSET, EDGE_MUTUAL_MIN_CURVE_OFFSET } from './colors';

type Point = {
  x: number;
  y: number;
};

const EDGE_ARROW_LENGTH = 12;
const EDGE_ARROW_HALF_WIDTH = 6;
const LOOP_OFFSET = GRAPH_NODE_RADIUS + 22;
const LOOP_SIDE_SPREAD = GRAPH_NODE_RADIUS * 0.72;
const LOOP_CONTROL_SPREAD = GRAPH_NODE_RADIUS * 1.18;

const toPrecision = (value: number): string => value.toFixed(3);

const normalize = (x: number, y: number): Point => {
  const length = Math.hypot(x, y) || 1;

  return {
    x: x / length,
    y: y / length,
  };
};

const perpendicular = ({ x, y }: Point): Point => ({
  x: -y,
  y: x,
});

const add = (first: Point, second: Point): Point => ({
  x: first.x + second.x,
  y: first.y + second.y,
});

const multiply = (point: Point, factor: number): Point => ({
  x: point.x * factor,
  y: point.y * factor,
});

const midpoint = (first: Point, second: Point): Point => ({
  x: (first.x + second.x) / 2,
  y: (first.y + second.y) / 2,
});

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

type ArrowShape = {
  shaftEnd: Point;
  arrowPath: string;
};

const createArrowShape = (tip: Point, direction: Point): ArrowShape => {
  const normal = perpendicular(direction);
  const baseCenter = add(tip, multiply(direction, -EDGE_ARROW_LENGTH));
  const left = add(baseCenter, multiply(normal, EDGE_ARROW_HALF_WIDTH));
  const right = add(baseCenter, multiply(normal, -EDGE_ARROW_HALF_WIDTH));

  return {
    shaftEnd: baseCenter,
    arrowPath: `M ${toPrecision(tip.x)} ${toPrecision(tip.y)} L ${toPrecision(left.x)} ${toPrecision(left.y)} L ${toPrecision(right.x)} ${toPrecision(right.y)} Z`,
  };
};

export type EdgeRenderPosition = Point;

export type StraightEdgeGeometry = {
  linePath: string;
  arrowPath: string;
};

export const getStraightEdgeGeometry = (
  sourceCenter: Point,
  targetCenter: Point,
): StraightEdgeGeometry => {
  const direction = normalize(targetCenter.x - sourceCenter.x, targetCenter.y - sourceCenter.y);
  const start = add(sourceCenter, multiply(direction, GRAPH_NODE_RADIUS));
  const tip = add(targetCenter, multiply(direction, -(GRAPH_NODE_RADIUS + 1)));
  const arrowShape = createArrowShape(tip, direction);

  return {
    linePath: `M ${toPrecision(start.x)} ${toPrecision(start.y)} L ${toPrecision(arrowShape.shaftEnd.x)} ${toPrecision(arrowShape.shaftEnd.y)}`,
    arrowPath: arrowShape.arrowPath,
  };
};

export const getTemporaryStraightEdgeGeometry = (
  sourceCenter: Point,
  cursorPoint: Point,
): StraightEdgeGeometry => {
  const direction = normalize(cursorPoint.x - sourceCenter.x, cursorPoint.y - sourceCenter.y);
  const start = add(sourceCenter, multiply(direction, GRAPH_NODE_RADIUS));
  const minimumTipDistance = EDGE_ARROW_LENGTH + 4;
  const currentTipDistance = Math.hypot(cursorPoint.x - start.x, cursorPoint.y - start.y);
  const tip =
    currentTipDistance >= minimumTipDistance
      ? cursorPoint
      : add(start, multiply(direction, minimumTipDistance));
  const arrowShape = createArrowShape(tip, direction);

  return {
    linePath: `M ${toPrecision(start.x)} ${toPrecision(start.y)} L ${toPrecision(arrowShape.shaftEnd.x)} ${toPrecision(arrowShape.shaftEnd.y)}`,
    arrowPath: arrowShape.arrowPath,
  };
};

export type CurvedEdgeGeometry = {
  curvePath: string;
  arrowPath: string;
};

export const getCurvedEdgeGeometry = (
  sourceCenter: Point,
  targetCenter: Point,
  bendDirection: 1 | -1,
): CurvedEdgeGeometry => {
  const direction = normalize(targetCenter.x - sourceCenter.x, targetCenter.y - sourceCenter.y);
  const normal = multiply(perpendicular(direction), bendDirection);
  const start = add(sourceCenter, multiply(direction, GRAPH_NODE_RADIUS));
  const tip = add(targetCenter, multiply(direction, -(GRAPH_NODE_RADIUS + 1)));
  const distance = Math.hypot(targetCenter.x - sourceCenter.x, targetCenter.y - sourceCenter.y);
  const curveOffset = clamp(distance * 0.24, EDGE_MUTUAL_MIN_CURVE_OFFSET, EDGE_MUTUAL_MAX_CURVE_OFFSET);
  const control = add(midpoint(start, tip), multiply(normal, curveOffset));
  const tipDirection = normalize(tip.x - control.x, tip.y - control.y);
  const arrowShape = createArrowShape(tip, tipDirection);

  return {
    curvePath: `M ${toPrecision(start.x)} ${toPrecision(start.y)} Q ${toPrecision(control.x)} ${toPrecision(control.y)}, ${toPrecision(arrowShape.shaftEnd.x)} ${toPrecision(arrowShape.shaftEnd.y)}`,
    arrowPath: arrowShape.arrowPath,
  };
};

export type LoopEdgeGeometry = {
  loopPath: string;
  arrowPath: string;
};

export const getLoopEdgeGeometry = (nodeCenter: Point): LoopEdgeGeometry => {
  const outward = normalize(nodeCenter.x - GRAPH_CENTER_X, nodeCenter.y - GRAPH_CENTER_Y);
  const tangent = perpendicular(outward);

  const start = add(
    add(nodeCenter, multiply(outward, GRAPH_NODE_RADIUS * 0.68)),
    multiply(tangent, -LOOP_SIDE_SPREAD),
  );
  const end = add(
    add(nodeCenter, multiply(outward, GRAPH_NODE_RADIUS * 0.68)),
    multiply(tangent, LOOP_SIDE_SPREAD),
  );
  const control1 = add(
    add(nodeCenter, multiply(outward, LOOP_OFFSET)),
    multiply(tangent, -LOOP_CONTROL_SPREAD),
  );
  const control2 = add(
    add(nodeCenter, multiply(outward, LOOP_OFFSET)),
    multiply(tangent, LOOP_CONTROL_SPREAD),
  );
  const endDirection = normalize(end.x - control2.x, end.y - control2.y);
  const arrowShape = createArrowShape(end, endDirection);

  return {
    loopPath: `M ${toPrecision(start.x)} ${toPrecision(start.y)} C ${toPrecision(control1.x)} ${toPrecision(control1.y)}, ${toPrecision(control2.x)} ${toPrecision(control2.y)}, ${toPrecision(arrowShape.shaftEnd.x)} ${toPrecision(arrowShape.shaftEnd.y)}`,
    arrowPath: arrowShape.arrowPath,
  };
};

