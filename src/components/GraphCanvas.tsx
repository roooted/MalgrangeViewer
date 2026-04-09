import {
  Background,
  BackgroundVariant,
  ReactFlow,
  type Edge as FlowEdge,
  type EdgeTypes,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react';
import { useCallback, useMemo, useState } from 'react';
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
  hoveredVertexId: VertexId | null;
  pendingEdgeSourceId: VertexId | null;
  pendingEdgeTarget: FlowPoint | null;
  hoveredEdgeId: EdgeId | null;
  selectedEdgeId: EdgeId | null;
  onNodeClick: (vertexId: VertexId, cursorPosition: FlowPoint) => void;
  onNodeHover: (vertexId: VertexId | null) => void;
  onEdgeHover: (edgeId: EdgeId | null) => void;
  onEdgeSelect: (edgeId: EdgeId) => void;
  onPointerMove: (cursorPosition: FlowPoint) => void;
};

const edgeTypes: EdgeTypes = {
  straightCenter: StraightCenterEdge,
  curvedCenter: CurvedCenterEdge,
  loop: LoopEdge,
};

const isDomainEdgeId = (value: string): value is EdgeId => value.includes('->');

const getNodeClassName = (
  vertexId: VertexId,
  hoveredVertexId: VertexId | null,
  pendingEdgeSourceId: VertexId | null,
): string => {
  const classes = ['graph-node'];

  if (hoveredVertexId === vertexId) {
    classes.push('graph-node--hovered');
  }

  if (pendingEdgeSourceId === vertexId) {
    classes.push('graph-node--source');
  }

  return classes.join(' ');
};

export function GraphCanvas({
  vertices,
  edges,
  hoveredVertexId,
  pendingEdgeSourceId,
  pendingEdgeTarget,
  hoveredEdgeId,
  selectedEdgeId,
  onNodeClick,
  onNodeHover,
  onEdgeHover,
  onEdgeSelect,
  onPointerMove,
}: GraphCanvasProps) {
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<Node, FlowEdge> | null>(null);
  const layoutItems = useMemo(() => createCircleLayout(vertices), [vertices]);

  const nodes = useMemo<Node[]>(
    () =>
      layoutItems.map(({ id, label, position }) => ({
        id,
        type: 'default',
        className: getNodeClassName(id, hoveredVertexId, pendingEdgeSourceId),
        position,
        data: { label },
        draggable: false,
        selectable: false,
      })),
    [hoveredVertexId, layoutItems, pendingEdgeSourceId],
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
            targetCenter: pendingEdgeTarget ?? {
              x: sourceCenter.x + GRAPH_NODE_RADIUS * 2.1,
              y: sourceCenter.y,
            },
            variant: 'temporary',
          } satisfies EdgeRenderData,
          selectable: false,
          focusable: false,
        });
      }
    }

    return result;
  }, [edges, hoveredEdgeId, layoutItems, pendingEdgeSourceId, pendingEdgeTarget, selectedEdgeId]);

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

  const handlePointerMove = useCallback(
    (event: { clientX: number; clientY: number }) => {
      const nextPosition = toFlowPosition(event);

      if (!nextPosition) {
        return;
      }

      onPointerMove(nextPosition);
    },
    [onPointerMove, toFlowPosition],
  );

  return (
    <div className="graph-canvas">
      <ReactFlow
        nodeOrigin={[0.5, 0.5]}
        fitView
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
        fitViewOptions={{ padding: 0.22 }}
        onInit={(instance) => setFlowInstance(instance)}
        onPaneMouseMove={(event) => handlePointerMove(event)}
        onNodeMouseMove={(event) => handlePointerMove(event)}
        onEdgeMouseMove={(event) => handlePointerMove(event)}
        onNodeClick={(event, node) => {
          const cursorPosition = toFlowPosition(event);

          if (!cursorPosition) {
            return;
          }

          onNodeClick(node.id as VertexId, cursorPosition);
        }}
        onNodeMouseEnter={(_, node) => onNodeHover(node.id as VertexId)}
        onNodeMouseLeave={() => onNodeHover(null)}
        onEdgeMouseEnter={(_, edge) => {
          if (!isDomainEdgeId(edge.id)) {
            return;
          }

          onEdgeHover(edge.id);
        }}
        onEdgeMouseLeave={() => onEdgeHover(null)}
        onEdgeClick={(_, edge) => {
          if (!isDomainEdgeId(edge.id)) {
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

