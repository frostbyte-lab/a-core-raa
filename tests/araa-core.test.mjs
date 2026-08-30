import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeAraaEvidence, ARAA_IDENTITY, redactAraaEvidence } from '../src/araa-core.js';
import { ARAA_CASE_DATASET, ARAA_DATASET_VERSION, ARAA_PATTERN_CAPACITY, getAraaDatasetStats, matchAraaDataset } from '../src/araa-dataset.js';
import { createAraaPatternIndex } from '../src/araa-pattern-index.js';
import worker from '../src/worker.js';

test('chat endpoint answers everyday greetings through Workers AI', async () => {
  const request = new Request('https://example.test/api/chat', { method: 'POST', body: JSON.stringify({ messages: [{ role: 'user', content: 'Halo' }] }) });
  const response = await worker.fetch(request, { AI: { run: async (model, input) => ({ response: `Hai dari ${model}: ${input.messages.at(-1).content}` }) } });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.match(body.message.content, /Halo/);
});

test('v1 API requires API key and accepts Bearer key', async () => {
  const unauthenticated = await worker.fetch(new Request('https://example.test/api/v1/health'), { AI: {} , ARAA_API_KEY: 'test-key' });
  assert.equal(unauthenticated.status, 401);
  const authenticated = await worker.fetch(new Request('https://example.test/api/v1/health', { headers: { authorization: 'Bearer test-key' } }), { AI: {}, ARAA_API_KEY: 'test-key' });
  assert.equal(authenticated.status, 200);
});

test('chat endpoint refuses empty messages without AI call', async () => {
  const request = new Request('https://example.test/api/chat', { method: 'POST', body: JSON.stringify({ messages: [] }) });
  const response = await worker.fetch(request, { AI: { run: async () => ({ response: 'unexpected' }) } });
  assert.equal(response.status, 400);
});

test('A Core Raa is standalone and exposes identity', () => {
  assert.equal(ARAA_IDENTITY.name, 'A Core Raa');
  assert.equal(ARAA_IDENTITY.externalAI, false);
  const result = analyzeAraaEvidence({ manifest: { files: ['index.html'] }, files: ['index.html'], integrity: true, dependencyGraph: {} });
  assert.equal(result.mode, 'standalone');
  assert.ok(result.score >= 0 && result.score <= 100);
});

test('A Core Raa redacts secret evidence', () => {
  const clean = redactAraaEvidence({ authorization: 'secret', nested: { apiKey: 'hidden', ok: 'visible' } });
  assert.equal(clean.authorization, '[redacted]');
  assert.equal(clean.nested.apiKey, '[redacted]');
  assert.equal(clean.nested.ok, 'visible');
});

test('local dataset covers broad game-web failure modes', () => {
  assert.ok(ARAA_CASE_DATASET.length >= 50);
  assert.equal(typeof ARAA_DATASET_VERSION, 'string');
  const matches = matchAraaDataset(['G1006', 'service worker', 'websocket', 'integrity mismatch', 'captcha', 'webassembly', '429 rate limit', 'mixed content']);
  assert.ok(matches.some((item) => item.id === 'URL-G1006'));
  assert.ok(matches.some((item) => item.id === 'CACHE-SW'));
  assert.ok(matches.some((item) => item.id === 'API-WEBSOCKET'));
  assert.ok(matches.some((item) => item.id === 'CAPTURE-BOT-GATE'));
  assert.ok(matches.some((item) => item.id === 'RUNTIME-WASM'));
  assert.ok(matches.some((item) => item.id === 'API-RATE-LIMIT'));
  assert.ok(matches.some((item) => item.id === 'SECURITY-MIXED'));
});

test('indexed matcher preserves exact matching semantics', () => {
  const index = createAraaPatternIndex([
    { indicators: ['ERR_NAME_NOT_RESOLVED', 'DNS'] },
    { indicators: ['service worker'] },
    { indicators: ['websocket'] }
  ]);
  assert.deepEqual(index.match(['DNS failure']), [0]);
  assert.deepEqual(index.match(['service worker and websocket']), [1, 2]);
});

test('analysis reports dataset version and matched patterns', () => {
  const result = analyzeAraaEvidence({ errors: ['G1006'], api: ['wss://example.test'], security: { protectedResources: ['license'] } });
  assert.equal(result.dataset.caseCount >= 20, true);
  assert.equal(result.dataset.version, ARAA_DATASET_VERSION);
  assert.equal(result.dataset.capacity, ARAA_PATTERN_CAPACITY);
  assert.equal(result.dataset.stats.loadedCaseCount, ARAA_CASE_DATASET.length);
  assert.ok(result.dataset.matched.some((item) => item.id === 'URL-G1006'));
});

test('A Core Raa explains blockers from evidence', () => {
  const result = analyzeAraaEvidence({ manifest: {}, missingAssets: ['a.js'], errors: ['G1006'], protectedResources: ['license'], totalFiles: 320 });
  assert.equal(result.findings.some((f) => f.id === 'ARAA-ASSET'), true);
  assert.equal(result.findings.some((f) => f.id === 'ARAA-PROTECTED'), true);
  assert.ok(result.priorities.length > 0);
});
