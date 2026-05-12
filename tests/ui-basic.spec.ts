import { expect, test, type Page } from '@playwright/test';

const vertexIds = Array.from({ length: 8 }, (_, index) => `x${index + 1}`);

async function clickGraphNode(page: Page, vertexId: string) {
  const node = page.locator('.react-flow__node').filter({
    has: page.getByTestId(`graph-node-${vertexId}`),
  });

  await node.click();
}

function getGraphNode(page: Page, vertexId: string) {
  return page.locator('.react-flow__node').filter({
    has: page.getByTestId(`graph-node-${vertexId}`),
  });
}

test('renders the initial workspace', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Malgrange Graph Visualizer' })).toBeVisible();
  await expect(page.getByTestId('graph-canvas')).toBeVisible();
  await expect(page.getByTestId('adjacency-matrix')).toBeVisible();
  await expect(page.getByTestId('result-panel')).toBeVisible();

  await expect(page.getByTestId('vertex-count-input')).toHaveValue('8');
  await expect(page.getByTestId('apply-button')).toBeVisible();
  await expect(page.getByTestId('example-button')).toBeVisible();
  await expect(page.getByTestId('clear-button')).toBeVisible();
  await expect(page.getByTestId('find-components-button')).toBeVisible();
  await expect(page.getByTestId('undo-button')).toHaveText('<');
  await expect(page.getByTestId('redo-button')).toHaveText('>');

  for (const vertexId of vertexIds) {
    await expect(page.getByTestId(`graph-node-${vertexId}`)).toBeVisible();
  }

  const matrixCells = page.getByTestId(/^matrix-cell-/);
  await expect(matrixCells).toHaveCount(64);

  for (const sourceId of vertexIds) {
    for (const targetId of vertexIds) {
      await expect(page.getByTestId(`matrix-cell-${sourceId}-${targetId}`)).toHaveText('0');
    }
  }

  await expect(page.getByTestId('result-panel')).toContainText(
    'No components calculated yet. Click Find Components to run the Malgrange algorithm.',
  );
});

test('syncs matrix changes to the directed graph', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('matrix-cell-x1-x2').click();

  await expect(page.getByTestId('matrix-cell-x1-x2')).toHaveText('1');
  await expect(page.getByTestId('graph-edge-x1-x2')).toBeVisible();
  await expect(page.getByTestId('graph-edge-x2-x1')).toHaveCount(0);

  await page.getByTestId('matrix-cell-x1-x2').click();

  await expect(page.getByTestId('matrix-cell-x1-x2')).toHaveText('0');
  await expect(page.getByTestId('graph-edge-x1-x2')).toHaveCount(0);
});

test('syncs graph edge creation back to the matrix', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');

  await clickGraphNode(page, 'x1');
  await clickGraphNode(page, 'x3');

  await expect(page.getByTestId('graph-edge-x1-x3')).toBeVisible();
  await expect(page.getByTestId('matrix-cell-x1-x3')).toHaveText('1');
  await expect(page.getByTestId('matrix-cell-x3-x1')).toHaveText('0');
});

test('highlights graph and matrix elements while hovering a calculated component', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');

  await page.getByTestId('example-button').click();
  await page.getByTestId('find-components-button').click();

  const firstComponent = page.getByTestId('result-component-component-1');

  await expect(firstComponent).toContainText('x1, x7, x11');
  await firstComponent.hover();

  await expect(firstComponent).toHaveClass(/result-panel__item--highlighted/);
  await expect(page.getByTestId('result-component-component-2')).toHaveClass(/result-panel__item--dimmed/);
  await expect(getGraphNode(page, 'x1')).toHaveClass(/graph-node--component-highlighted/);
  await expect(getGraphNode(page, 'x2')).toHaveClass(/graph-node--component-dimmed/);
  await expect(page.getByTestId('graph-edge-x1-x7')).toHaveClass(/graph-edge--component-highlighted/);
  await expect(page.getByTestId('graph-edge-x2-x2')).toHaveClass(/graph-edge--component-dimmed/);
  await expect(page.getByTestId('matrix-cell-x1-x7')).toHaveClass(/matrix__cell--component-highlighted/);
  await expect(page.getByTestId('matrix-cell-x2-x2')).toHaveClass(/matrix__cell--component-dimmed/);

  await page.getByTestId('matrix-cell-x1-x7').click();

  await expect(page.getByTestId('result-panel')).toContainText(
    'No components calculated yet. Click Find Components to run the Malgrange algorithm.',
  );
  await expect(page.getByTestId('result-component-component-1')).toHaveCount(0);
  await expect(getGraphNode(page, 'x1')).not.toHaveClass(/graph-node--component-highlighted/);
});
