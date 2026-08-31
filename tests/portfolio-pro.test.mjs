import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

test('portfolio presents the project as a large, measurable platform', () => {
  for (const marker of ['Strategic AI Platform', 'Evidence Intelligence', 'AI Orchestrator', 'Data Seat', 'Secure Delivery', 'Security by design', 'Roadmap besar', '40B', 'target kapasitas arsitektur']) {
    assert.match(html, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
