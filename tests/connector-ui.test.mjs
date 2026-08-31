import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

test('Xentinel logo and connector controls are present', async () => {
  assert.match(html, /src="\/xentinel-logo\.jpg"/);
  assert.match(html, /id="attach-open"/);
  assert.match(html, /id="connector-open"/);
  assert.match(html, /id="connector-search"/);
  assert.match(html, /GitHub/);
  assert.match(html, /WhatsApp Business/);
  assert.match(html, /Terhubung \(sesi lokal\)/);
  const logo = await stat(new URL('../public/xentinel-logo.jpg', import.meta.url));
  assert.ok(logo.size > 1000);
});
