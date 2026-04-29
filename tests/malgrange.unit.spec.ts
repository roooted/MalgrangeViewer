import { expect, test } from '@playwright/test';
import { runMalgrange } from '../src/algorithms/malgrange';
import { buildSimpleGraphFromState } from '../src/model/graphState';
import { getExamplePreset } from '../src/model/presets';
import type { ComponentResult, EdgeId, SimpleGraph, VertexId } from '../src/model/types';

type EdgeTuple = [VertexId, VertexId];

type ExpectedComponent = {
  id: string;
  vertexIds: VertexId[];
  edgeIds: EdgeId[];
};

const edgeId = ([source, target]: EdgeTuple): EdgeId => `${source}->${target}` as EdgeId;

const createSimpleGraph = (vertices: VertexId[], edges: EdgeTuple[]): SimpleGraph => {
  const adjacencyList = Object.fromEntries(vertices.map((vertexId) => [vertexId, [] as VertexId[]])) as Record<
    VertexId,
    VertexId[]
  >;
  const reverseAdjacencyList = Object.fromEntries(vertices.map((vertexId) => [vertexId, [] as VertexId[]])) as Record<
    VertexId,
    VertexId[]
  >;

  edges.forEach(([source, target]) => {
    adjacencyList[source].push(target);
    reverseAdjacencyList[target].push(source);
  });

  return {
    vertices,
    adjacencyList,
    reverseAdjacencyList,
  };
};

const expectComponents = (actual: ComponentResult[], expected: ExpectedComponent[]) => {
  expect(actual).toHaveLength(expected.length);

  expected.forEach((expectedComponent, index) => {
    expect(actual[index].id).toBe(expectedComponent.id);
    expect(actual[index].vertexIds).toEqual(expectedComponent.vertexIds);
    expect(actual[index].edgeIds).toEqual(expectedComponent.edgeIds);
    expect(actual[index].color).toEqual(expect.any(String));
    expect(actual[index].color.length).toBeGreaterThan(0);
  });
};

test('returns one component for each isolated vertex', () => {
  const graph = createSimpleGraph(['x1', 'x2', 'x3'], []);

  expectComponents(runMalgrange(graph), [
    { id: 'component-1', vertexIds: ['x1'], edgeIds: [] },
    { id: 'component-2', vertexIds: ['x2'], edgeIds: [] },
    { id: 'component-3', vertexIds: ['x3'], edgeIds: [] },
  ]);
});

test('returns a single component for one directed cycle', () => {
  const edges: EdgeTuple[] = [
    ['x1', 'x2'],
    ['x2', 'x3'],
    ['x3', 'x1'],
  ];
  const graph = createSimpleGraph(['x1', 'x2', 'x3'], edges);

  expectComponents(runMalgrange(graph), [
    {
      id: 'component-1',
      vertexIds: ['x1', 'x2', 'x3'],
      edgeIds: edges.map(edgeId),
    },
  ]);
});

test('splits multiple strongly connected components and excludes cross edges', () => {
  const graph = createSimpleGraph(
    ['x1', 'x2', 'x3', 'x4', 'x5'],
    [
      ['x1', 'x2'],
      ['x2', 'x1'],
      ['x2', 'x3'],
      ['x3', 'x4'],
      ['x4', 'x5'],
      ['x5', 'x3'],
    ],
  );

  expectComponents(runMalgrange(graph), [
    {
      id: 'component-1',
      vertexIds: ['x1', 'x2'],
      edgeIds: ['x1->x2', 'x2->x1'],
    },
    {
      id: 'component-2',
      vertexIds: ['x3', 'x4', 'x5'],
      edgeIds: ['x3->x4', 'x4->x5', 'x5->x3'],
    },
  ]);
});

test('keeps loop edges inside single-vertex components', () => {
  const graph = createSimpleGraph(
    ['x1', 'x2'],
    [
      ['x1', 'x1'],
    ],
  );

  expectComponents(runMalgrange(graph), [
    { id: 'component-1', vertexIds: ['x1'], edgeIds: ['x1->x1'] },
    { id: 'component-2', vertexIds: ['x2'], edgeIds: [] },
  ]);
});

test('treats opposite directed edges as one component', () => {
  const graph = createSimpleGraph(
    ['x1', 'x2'],
    [
      ['x1', 'x2'],
      ['x2', 'x1'],
    ],
  );

  expectComponents(runMalgrange(graph), [
    {
      id: 'component-1',
      vertexIds: ['x1', 'x2'],
      edgeIds: ['x1->x2', 'x2->x1'],
    },
  ]);
});

test('handles disconnected graph with cycles, isolated vertices, and one-way chains', () => {
  const graph = createSimpleGraph(
    ['x1', 'x2', 'x3', 'x4', 'x5', 'x6'],
    [
      ['x1', 'x2'],
      ['x2', 'x1'],
      ['x4', 'x5'],
      ['x5', 'x6'],
    ],
  );

  expectComponents(runMalgrange(graph), [
    { id: 'component-1', vertexIds: ['x1', 'x2'], edgeIds: ['x1->x2', 'x2->x1'] },
    { id: 'component-2', vertexIds: ['x3'], edgeIds: [] },
    { id: 'component-3', vertexIds: ['x4'], edgeIds: [] },
    { id: 'component-4', vertexIds: ['x5'], edgeIds: [] },
    { id: 'component-5', vertexIds: ['x6'], edgeIds: [] },
  ]);
});

test('matches the example preset components', () => {
  const graph = buildSimpleGraphFromState(getExamplePreset());

  expectComponents(runMalgrange(graph), [
    { id: 'component-1', vertexIds: ['x1', 'x7', 'x11'], edgeIds: ['x1->x7', 'x7->x11', 'x11->x1'] },
    { id: 'component-2', vertexIds: ['x2'], edgeIds: ['x2->x2'] },
    {
      id: 'component-3',
      vertexIds: ['x3', 'x9', 'x10'],
      edgeIds: ['x3->x3', 'x3->x9', 'x3->x10', 'x9->x3', 'x10->x9'],
    },
    { id: 'component-4', vertexIds: ['x4', 'x5'], edgeIds: ['x4->x4', 'x4->x5', 'x5->x4'] },
    { id: 'component-5', vertexIds: ['x6'], edgeIds: ['x6->x6'] },
    { id: 'component-6', vertexIds: ['x8'], edgeIds: [] },
  ]);
});
