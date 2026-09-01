import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

test('legacy GitHub and Cloudflare connectors are not exposed in user UI', () => {
  assert.doesNotMatch(html, /<h3>GitHub<\/h3>|<h3>Cloudflare<\/h3>/);
  assert.doesNotMatch(html, /Cari GitHub/);
  assert.doesNotMatch(html, /\[['"]GitHub['"],|\[['"]Cloudflare['"],/);
  assert.doesNotMatch(html, /Cloudflared Tunnel dikonfigurasi/);
});
