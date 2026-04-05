import {
  Background,
  BackgroundVariant,
  ReactFlow,
  type Edge as FlowEdge,
  type EdgeTypes,
  type Node,
} from '@xyflow/react';
import { useMemo } from 'react';
import type { Edge, Vertex } from '../model/types';
import { LoopEdge } from './LoopEdge';
import { StraightCenterEdge } from './StraightCenterEdge';
import { createCircleLayout } from '../utils/circleLayout';

type GraphCanvasProps = {
  vertices: Vertex[];
  edges: Edge[];
};

type EdgeRenderData = {
  sourceCenter: {
    x: number;
    y: number;
  };
  targetCenter: {
    x: number;
    y: number;
  };
};

const edgeTypes: EdgeTypes = {
  straightCenter: StraightCenterEdge,
  loop: LoopEdge,
};

export function GraphCanvas({ vertices, edges }: GraphCanvasProps) {
  const layoutItems = useMemo(() => createCircleLayout(vertices), [vertices]);

  const nodes = useMemo<Node[]>(
    () =>
      layoutItems.map(({ id, label, position }) => ({
        id,
        type: 'default',
        className: 'graph-node',
        position,
        data: { label },
        draggable: false,
        selectable: false,
      })),
    [layoutItems],
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

      result.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.source === edge.target ? 'loop' : 'straightCenter',
        data: {
          sourceCenter,
          targetCenter,
        } satisfies EdgeRenderData,
        selectable: false,
        focusable: false,
      });
    });

    return result;
  }, [edges, layoutItems]);

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
