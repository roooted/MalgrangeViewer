import {
  Background,
  BackgroundVariant,
  ReactFlow,
  type Edge as FlowEdge,
  type EdgeTypes,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Edge, EdgeId, FlowPoint, Vertex, VertexId } from '../model/types';
import { createCircleLayout, GRAPH_NODE_RADIUS } from '../utils/circleLayout';
import { hasMutualPair } from '../utils/edgePairing';
import { CurvedCenterEdge } from './CurvedCenterEdge';
import { LoopEdge } from './LoopEdge';
import { StraightCenterEdge } from './StraightCenterEdge';
import type { CurvedEdgeRenderData, EdgeRenderData } from './edgeRenderTypes';

type GraphCanvasProps = {
  vertices: Vertex[];
  edges: Edge[];
  pendingEdgeSourceId: VertexId | null;
  hoveredEdgeId: EdgeId | null;
  selectedEdgeId: EdgeId | null;
  onNodeClick: (vertexId: VertexId) => void;
  onEdgeHover: (edgeId: EdgeId | null) => void;
  onEdgeSelect: (edgeId: EdgeId) => void;
};

const edgeTypes: EdgeTypes = {
  straightCenter: StraightCenterEdge,
  curvedCenter: CurvedCenterEdge,
  loop: LoopEdge,
};

const FIT_VIEW_OPTIONS = { padding: 0.22 };

const isDomainEdgeId = (value: string): value is EdgeId => value.includes('->');

const getNodeClassName = (vertexId: VertexId, pendingEdgeSourceId: VertexId | null): string => {
  const classes = ['graph-node'];

  if (pendingEdgeSourceId === vertexId) {
    classes.push('graph-node--source');
  }

  return classes.join(' ');
};

export function GraphCanvas({
  vertices,
  edges,
  pendingEdgeSourceId,
  hoveredEdgeId,
  selectedEdgeId,
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
      layoutItems.map(({ id, label, position }) => ({
        id,
        type: 'default',
        className: getNodeClassName(id, pendingEdgeSourceId),
        position,
        data: { label },
        draggable: false,
        selectable: false,
      })),
    [layoutItems, pendingEdgeSourceId],
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
    edges,
    hoveredEdgeId,
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
    <div className="graph-canvas">
      <ReactFlow
        nodeOrigin={[0.5, 0.5]}
        nodes={nodes}
        edges={flowEdges}
        edgeTypes={edgeTypes}
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
