import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

test('all open UI surfaces have close controls', () => {
  for (const id of ['attach-close', 'connector-close', 'feedback-close', 'panel-code', 'panel-image', 'panel-document', 'panel-evidence', 'panel-portfolio', 'panel-connect']) {
    assert.match(html, new RegExp(id));
  }
  assert.match(html, /Universal close controls and premium connector/);
  assert.match(html, /connectorSweep/);
});
