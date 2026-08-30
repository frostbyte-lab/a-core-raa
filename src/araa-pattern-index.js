/*
 * Compact inverted index for large deterministic pattern corpora.
 * The index stores indicator -> candidate pattern IDs, then verifies candidates
 * against the original indicator strings to preserve substring semantics.
 */

const TOKEN = /[a-z0-9][a-z0-9:_-]{2,}/gi;

function normalize(value) {
  return String(value ?? "").toLowerCase();
}

function tokens(value) {
  return [...new Set(normalize(value).match(TOKEN) || [])];
}

export function createAraaPatternIndex(entries = []) {
  const postings = new Map();
  const normalizedIndicators = entries.map((entry) => entry.indicators.map(normalize));
  for (let id = 0; id < normalizedIndicators.length; id += 1) {
    for (const indicator of normalizedIndicators[id]) {
      for (const token of tokens(indicator)) {
        let bucket = postings.get(token);
        if (!bucket) postings.set(token, bucket = []);
        bucket.push(id);
      }
    }
  }
  for (const [token, bucket] of postings) {
    bucket.sort((a, b) => a - b);
    postings.set(token, Uint32Array.from(bucket.filter((value, index) => index === 0 || value !== bucket[index - 1])));
  }
  return Object.freeze({
    size: entries.length,
    indexedTokens: postings.size,
    match(values = [], limit = Infinity) {
      const haystack = values.map(normalize).join(" ");
      const candidates = new Set();
      for (const token of tokens(haystack)) {
        const bucket = postings.get(token);
        if (!bucket) continue;
        for (const id of bucket) {
          candidates.add(id);
          if (Number.isFinite(limit) && candidates.size >= limit) break;
        }
        if (Number.isFinite(limit) && candidates.size >= limit) break;
      }
      return [...candidates]
        .sort((a, b) => a - b)
        .filter((id) => normalizedIndicators[id].some((indicator) => haystack.includes(indicator)));
    }
  });
}

export function estimateAraaIndexMemory(entries = []) {
  let chars = 0;
  let indicators = 0;
  for (const entry of entries) {
    for (const indicator of entry.indicators || []) {
      chars += String(indicator).length;
      indicators += 1;
    }
  }
  return { entries: entries.length, indicators, indicatorCharacters: chars };
}
