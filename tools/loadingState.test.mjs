import assert from 'node:assert/strict';
import test from 'node:test';

async function loadSubject() {
  try {
    return await import('../src/ui/loading/loadingState.ts');
  } catch {
    assert.fail('Le module de progression du chargement doit exister');
  }
}

test('la progression accélère exponentiellement et finit en deux secondes', async () => {
  const { getLoadingPercentage, getLoadingProgress } = await loadSubject();

  assert.equal(getLoadingProgress(0), 0);
  assert.ok(Math.abs(getLoadingProgress(500) - 0.0585) < 0.0001);
  assert.ok(Math.abs(getLoadingProgress(1_000) - 0.1824) < 0.0001);
  assert.ok(Math.abs(getLoadingProgress(1_500) - 0.4447) < 0.0001);
  assert.ok(getLoadingProgress(1_999) > 0.998);
  assert.equal(getLoadingProgress(2_000), 1);
  assert.equal(getLoadingProgress(3_000), 1);
  assert.equal(typeof getLoadingPercentage, 'function');
  assert.equal(getLoadingPercentage(0), 0);
  assert.equal(getLoadingPercentage(500), 5);
  assert.equal(getLoadingPercentage(1_000), 18);
  assert.equal(getLoadingPercentage(1_500), 44);
  assert.equal(getLoadingPercentage(1_999), 99);
  assert.equal(getLoadingPercentage(2_000), 100);
});

test("l'application attend deux secondes et les polices", async () => {
  const { canLeaveLoadingScreen } = await loadSubject();

  assert.equal(canLeaveLoadingScreen(1_999, true), false);
  assert.equal(canLeaveLoadingScreen(2_000, false), false);
  assert.equal(canLeaveLoadingScreen(2_000, true), true);
});

test("l'illustration couvre un téléphone et reste entière en paysage", async () => {
  const { getLoadingArtworkLayout } = await loadSubject();
  assert.equal(typeof getLoadingArtworkLayout, 'function');

  const portrait = getLoadingArtworkLayout(390, 844);
  assert.equal(portrait.width, 390);
  assert.ok(portrait.height > 844);
  assert.ok(portrait.top < 0);

  const standardPhone = getLoadingArtworkLayout(1_080, 1_920);
  assert.equal(standardPhone.width, 1_080);
  assert.ok(standardPhone.height > 1_920);

  const landscape = getLoadingArtworkLayout(1_280, 720);
  assert.equal(landscape.height, 720);
  assert.ok(landscape.width < 1_280);
  assert.ok(landscape.left > 0);
});
