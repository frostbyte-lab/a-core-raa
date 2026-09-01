import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const root = new URL('../public/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const manifest = JSON.parse(await readFile(new URL('manifest.webmanifest', root), 'utf8'));

test('Xentinel is installable as a PWA with its real name and logo', async () => {
  assert.equal(manifest.name, 'Xentinel AI');
  assert.equal(manifest.short_name, 'Xentinel');
  assert.equal(manifest.display, 'standalone');
  assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(html, /apple-mobile-web-app-title" content="Xentinel"/);
  assert.match(html, /id="install-app"/);
  assert.match(html, /navigator\.serviceWorker\.register\('\/sw\.js\?build=20260901-3'/);
  assert.match(html, /updateViaCache:'none'/);
  assert.ok((await stat(new URL('icons/xentinel-192.png', root))).size > 1000);
  assert.ok((await stat(new URL('icons/xentinel-512.png', root))).size > 1000);
});
