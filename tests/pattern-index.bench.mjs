import { performance } from "node:perf_hooks";
import { createAraaPatternIndex } from "../src/araa-pattern-index.js";

const COUNT = 3_000_000;
const started = performance.now();
const entries = Array.from({ length: COUNT }, (_, id) => ({
  id: `SYN-${id}`,
  indicators: [`synthetic-pattern-${id}`]
}));
const built = performance.now();
const index = createAraaPatternIndex(entries);
const indexed = performance.now();
const result = index.match(["error synthetic-pattern-2999999"]);
const matched = performance.now();
if (result.length !== 1 || result[0] !== COUNT - 1) {
  throw new Error(`Benchmark mismatch: ${JSON.stringify(result)}`);
}
console.log(JSON.stringify({
  patterns: COUNT,
  indexedTokens: index.indexedTokens,
  buildInputMs: Math.round(built - started),
  indexBuildMs: Math.round(indexed - built),
  matchMs: Math.round(matched - indexed),
  matchedId: result[0]
}, null, 2));
