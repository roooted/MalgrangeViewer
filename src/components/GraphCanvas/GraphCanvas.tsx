import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type Edge as FlowEdge,
  type EdgeTypes,
  type Node,
  type NodeProps,
  type NodeTypes,
  type ReactFlowInstance,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Edge, EdgeId, FlowPoint, Vertex, VertexId } from '../../model/types';
import { createCircleLayout, GRAPH_NODE_RADIUS } from '../../utils/circleLayout';
import { COMPONENT_NODE_STROKE_COLOR, getComponentFillOpacityByColor, hexToRgba } from '../../utils/colors';
import { hasMutualPair } from '../../utils/edgePairing';
import { CurvedCenterEdge } from '../CurvedCenterEdge';
import { LoopEdge } from '../LoopEdge';
import { StraightCenterEdge } from '../StraightCenterEdge';
import type { CurvedEdgeRenderData, EdgeRenderData } from '../edgeRenderTypes';
import './GraphCanvas.module.css';

type GraphCanvasProps = {
  vertices: Vertex[];
  edges: Edge[];
  pendingEdgeSourceId: VertexId | null;
  hoveredEdgeId: EdgeId | null;
  selectedEdgeId: EdgeId | null;
  vertexColorById: Partial<Record<VertexId, string>>;
  edgeColorById: Partial<Record<EdgeId, string>>;
  isComponentHoverActive: boolean;
  highlightedVertexIds: ReadonlySet<VertexId>;
  highlightedEdgeIds: ReadonlySet<EdgeId>;
  onNodeClick: (vertexId: VertexId) => void;
  onEdgeHover: (edgeId: EdgeId | null) => void;
  onEdgeSelect: (edgeId: EdgeId) => void;
};

type NodeStyleWithVariable = CSSProperties & {
  '--node-component-color'?: string;
  '--node-component-fill'?: string;
};

type GraphNodeData = {
  label: string;
  testId: string;
};

function GraphNode({ data }: NodeProps<Node<GraphNodeData>>) {
  return (
    <div data-testid={data.testId}>
      <Handle position={Position.Top} style={{ opacity: 0 }} type="target" />
      {data.label}
      <Handle position={Position.Bottom} style={{ opacity: 0 }} type="source" />
    </div>
  );
}

const edgeTypes: EdgeTypes = {
  straightCenter: StraightCenterEdge,
  curvedCenter: CurvedCenterEdge,
  loop: LoopEdge,
};

const nodeTypes: NodeTypes = {
  graphNode: GraphNode,
};

const FIT_VIEW_OPTIONS = { padding: 0.22 };

const isDomainEdgeId = (value: string): value is EdgeId => value.includes('->');

const getNodeClassName = (
  vertexId: VertexId,
  pendingEdgeSourceId: VertexId | null,
  hasComponentColor: boolean,
  isComponentHoverActive: boolean,
  highlightedVertexIds: ReadonlySet<VertexId>,
): string => {
  const classes = ['graph-node'];
  const isHighlighted = highlightedVertexIds.has(vertexId);

  if (hasComponentColor) {
    classes.push('graph-node--component');
  }

  if (isComponentHoverActive && isHighlighted) {
    classes.push('graph-node--component-highlighted');
  }

  if (isComponentHoverActive && hasComponentColor && !isHighlighted) {
    classes.push('graph-node--component-dimmed');
  }

  if (pendingEdgeSourceId === vertexId) {
    classes.push('graph-node--source');
  }

  return classes.join(' ');
};

const getNodeStyle = (componentColor?: string): NodeStyleWithVariable | undefined => {
  if (!componentColor) {
    return undefined;
  }

  return {
    '--node-component-color': componentColor,
    '--node-component-fill': hexToRgba(componentColor, getComponentFillOpacityByColor(componentColor)),
    borderColor: COMPONENT_NODE_STROKE_COLOR,
  };
};

export function GraphCanvas({
  vertices,
  edges,
  pendingEdgeSourceId,
  hoveredEdgeId,
  selectedEdgeId,
  vertexColorById,
  edgeColorById,
  isComponentHoverActive,
  highlightedVertexIds,
  highlightedEdgeIds,
  onNodeClick,
  onEdgeHover,
  onEdgeSelect,
}: GraphCanvasProps) {
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<Node, FlowEdge> | null>(null);
  const [temporaryTarget, setTemporaryTarget] = useState<FlowPoint | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const pendingTargetRef = useRef<FlowPoint | null>(null);
  const lastFittedLayoutKeyRef = useRef<string | null>(null);
  const layoutItems = useMemo(() => createCircleLayout(vertices), [vertices]);
  const layoutKey = useMemo(() => vertices.map((vertex) => vertex.id).join('|'), [vertices]);
  const isEdgeInteractionEnabled = pendingEdgeSourceId === null;

  useEffect(() => {
    if (!flowInstance) {
      return;
    }

    if (lastFittedLayoutKeyRef.current === layoutKey) {
      return;
    }

    flowInstance.fitView(FIT_VIEW_OPTIONS);
    lastFittedLayoutKeyRef.current = layoutKey;
  }, [flowInstance, layoutKey]);

  useEffect(() => {
    pendingTargetRef.current = null;
    setTemporaryTarget(null);

    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  }, [pendingEdgeSourceId]);

  useEffect(
    () => () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    },
    [],
  );

  const nodes = useMemo<Node[]>(
    () =>
      layoutItems.map(({ id, label, position }) => {
        const componentColor = vertexColorById[id];

        return {
          id,
          type: 'graphNode',
          className: getNodeClassName(
            id,
            pendingEdgeSourceId,
            Boolean(componentColor),
            isComponentHoverActive,
            highlightedVertexIds,
          ),
          position,
          style: getNodeStyle(componentColor),
          data: { label, testId: `graph-node-${id}` },
          draggable: false,
          selectable: false,
        };
      }),
    [highlightedVertexIds, isComponentHoverActive, layoutItems, pendingEdgeSourceId, vertexColorById],
  );

  const flowEdges = useMemo(() => {
    const centersById = new Map(
      layoutItems.map((item) => [
        item.id,
        {
          x: item.position.x,
          y: item.position.y,
        },
      ]),
    );
    const result: FlowEdge[] = [];

    edges.forEach((edge) => {
      const sourceCenter = centersById.get(edge.source);
      const targetCenter = centersById.get(edge.target);

      if (!sourceCenter || !targetCenter) {
        return;
      }

      const variant: EdgeRenderData['variant'] =
        selectedEdgeId === edge.id ? 'selected' : hoveredEdgeId === edge.id ? 'hovered' : 'normal';
      const componentColor = edgeColorById[edge.id];
      const isComponentHighlighted = variant === 'normal' && highlightedEdgeIds.has(edge.id);
      const isComponentDimmed =
        variant === 'normal' && isComponentHoverActive && Boolean(componentColor) && !isComponentHighlighted;

      if (edge.source === edge.target) {
        result.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'loop',
          data: {
            sourceCenter,
            targetCenter,
            variant,
            componentColor,
            isComponentHighlighted,
            isComponentDimmed,
            isInteractive: isEdgeInteractionEnabled,
          } satisfies EdgeRenderData,
          selectable: false,
          focusable: false,
        });
        return;
      }

      if (hasMutualPair(edge, edges)) {
        const sourceIndex = Number.parseInt(edge.source.slice(1), 10);
        const targetIndex = Number.parseInt(edge.target.slice(1), 10);

        result.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'curvedCenter',
          data: {
            sourceCenter,
            targetCenter,
            variant,
            componentColor,
            isComponentHighlighted,
            isComponentDimmed,
            bendDirection: sourceIndex < targetIndex ? 1 : -1,
            isInteractive: isEdgeInteractionEnabled,
          } satisfies CurvedEdgeRenderData,
          selectable: false,
          focusable: false,
        });
        return;
      }

      result.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'straightCenter',
        data: {
          sourceCenter,
          targetCenter,
          variant,
          componentColor,
          isComponentHighlighted,
          isComponentDimmed,
          isInteractive: isEdgeInteractionEnabled,
        } satisfies EdgeRenderData,
        selectable: false,
        focusable: false,
      });
    });

    if (pendingEdgeSourceId !== null) {
      const sourceCenter = centersById.get(pendingEdgeSourceId);

      if (sourceCenter) {
        result.push({
          id: '__temporary__',
          source: pendingEdgeSourceId,
          target: pendingEdgeSourceId,
          type: 'straightCenter',
          data: {
            sourceCenter,
            targetCenter: temporaryTarget ?? {
              x: sourceCenter.x + GRAPH_NODE_RADIUS * 2.1,
              y: sourceCenter.y,
            },
            variant: 'temporary',
            isInteractive: false,
          } satisfies EdgeRenderData,
          selectable: false,
          focusable: false,
        });
      }
    }

    return result;
  }, [
    edgeColorById,
    edges,
    highlightedEdgeIds,
    hoveredEdgeId,
    isComponentHoverActive,
    isEdgeInteractionEnabled,
    layoutItems,
    pendingEdgeSourceId,
    selectedEdgeId,
    temporaryTarget,
  ]);

  const toFlowPosition = useCallback(
    (event: { clientX: number; clientY: number }): FlowPoint | null => {
      if (!flowInstance) {
        return null;
      }

      return flowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [flowInstance],
  );

  const commitPendingTarget = useCallback(() => {
    animationFrameIdRef.current = null;
    setTemporaryTarget(pendingTargetRef.current);
  }, []);

  const handlePointerMove = useCallback(
    (event: { clientX: number; clientY: number }) => {
      if (pendingEdgeSourceId === null) {
        return;
      }

      const nextPosition = toFlowPosition(event);

      if (!nextPosition) {
        return;
      }

      pendingTargetRef.current = nextPosition;

      if (animationFrameIdRef.current !== null) {
        return;
      }

      animationFrameIdRef.current = requestAnimationFrame(commitPendingTarget);
    },
    [commitPendingTarget, pendingEdgeSourceId, toFlowPosition],
  );

  return (
    <div className="graph-canvas" data-testid="graph-canvas">
      <ReactFlow
        nodeOrigin={[0.5, 0.5]}
        nodes={nodes}
        edges={flowEdges}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        edgesFocusable={false}
        zoomOnDoubleClick={false}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
        fitViewOptions={FIT_VIEW_OPTIONS}
        onInit={(instance) => setFlowInstance(instance)}
        onPaneMouseMove={(event) => handlePointerMove(event)}
        onNodeMouseMove={(event) => handlePointerMove(event)}
        onEdgeMouseMove={(event) => handlePointerMove(event)}
        onNodeClick={(_, node) => {
          onNodeClick(node.id as VertexId);
        }}
        onEdgeMouseEnter={(_, edge) => {
          if (!isEdgeInteractionEnabled || !isDomainEdgeId(edge.id)) {
            return;
          }

          onEdgeHover(edge.id);
        }}
        onEdgeMouseLeave={() => {
          if (!isEdgeInteractionEnabled) {
            return;
          }

          onEdgeHover(null);
        }}
        onEdgeClick={(_, edge) => {
          if (!isEdgeInteractionEnabled || !isDomainEdgeId(edge.id)) {
            return;
          }

          onEdgeSelect(edge.id);
        }}
      >
        <Background
          color="rgba(116, 145, 188, 0.18)"
          gap={28}
          size={1.2}
          variant={BackgroundVariant.Dots}
        />
      </ReactFlow>
    </div>
  );
}





