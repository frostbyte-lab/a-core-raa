import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const worker = await readFile(new URL('../src/worker.js', import.meta.url), 'utf8');

test('developer brain network and thinking visual are present', () => {
  assert.match(html, /class="brain-network"/);
  assert.match(html, /class="wire-laser"/);
  assert.match(html, /@keyframes laserRun/);
});

test('Data Seat uses server-side access and does not hardcode the requested code', () => {
  assert.match(html, /id="data-seat-key" type="password"/);
  assert.match(html, /\/api\/data-seat\/status/);
  assert.match(worker, /DATA_SEAT_KEY/);
  assert.doesNotMatch(html, /75752566/);
});
