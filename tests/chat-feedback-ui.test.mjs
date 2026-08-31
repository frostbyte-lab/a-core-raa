import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

test('chat has elite avatars, typing state, and feedback draft control', () => {
  assert.match(html, /id="feedback-open"/);
  assert.match(html, /id="feedback-modal"/);
  assert.match(html, /id="feedback-input"/);
  assert.match(html, /typewriter-cursor/);
  assert.match(html, /sedang menulis/);
  assert.match(html, /role==='user'\?'<svg/);
});
