import {
  Background,
  BackgroundVariant,
  MarkerType,
  ReactFlow,
  type Edge as FlowEdge,
  type Node,
} from '@xyflow/react';
import { useMemo } from 'react';
import type { Edge, Vertex } from '../model/types';
import { createCircleLayout } from '../utils/circleLayout';

type GraphCanvasProps = {
  vertices: Vertex[];
  edges: Edge[];
};

export function GraphCanvas({ vertices, edges }: GraphCanvasProps) {
  const nodes = useMemo<Node[]>(
    () =>
      createCircleLayout(vertices).map(({ id, label, position }) => ({
        id,
        type: 'default',
        className: 'graph-node',
        position,
        data: { label },
        draggable: false,
        selectable: false,
      })),
    [vertices],
  );

  const flowEdges = useMemo<FlowEdge[]>(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#8ea2ff',
        },
        style: {
          stroke: '#8ea2ff',
          strokeWidth: 2,
        },
        selectable: false,
      })),
    [edges],
  );

  return (
    <div className="graph-canvas">
      <ReactFlow
        fitView
        nodes={nodes}
        edges={flowEdges}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        edgesFocusable={false}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
        fitViewOptions={{ padding: 0.22 }}
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
