export const SENTINEL_REGISTRY_VERSION = "0.2.0";

export const SENTINEL_DOMAINS = Object.freeze({
  general: { label: "Umum", targetPatterns: 10_000_000, keywords: ["umum", "tugas", "rencana", "ringkas", "jelaskan", "ide", "menulis", "bahasa", "matematika", "belajar"] },
  automotive: { label: "Otomotif", targetPatterns: 10_000_000, keywords: ["mobil", "motor", "mesin", "oli", "rem", "ban", "aki", "busi", "transmisi", "obd", "kendaraan"] },
  coding: { label: "Coding", targetPatterns: 300_000_000, keywords: ["kode", "coding", "program", "javascript", "typescript", "python", "html", "css", "api", "bug", "error", "git", "github", "database", "function", "drm"] }
});

function normalize(value) { return String(value ?? "").toLocaleLowerCase("id-ID").normalize("NFKC"); }

export function routeSentinelDomains(input, requestedDomain) {
  const text = normalize(input);
  const scores = Object.fromEntries(Object.entries(SENTINEL_DOMAINS).map(([domain, config]) => [domain, config.keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0)]));
  if (requestedDomain && SENTINEL_DOMAINS[requestedDomain]) scores[requestedDomain] += 2;
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const selected = ranked[0][1] > 0 ? ranked.filter(([, score]) => score === ranked[0][1]).map(([domain]) => domain) : ["general"];
  return { selected, scores, registryVersion: SENTINEL_REGISTRY_VERSION };
}

export function registrySummary() {
  return { version: SENTINEL_REGISTRY_VERSION, totalTargetPatterns: Object.values(SENTINEL_DOMAINS).reduce((sum, domain) => sum + domain.targetPatterns, 0), domains: Object.fromEntries(Object.entries(SENTINEL_DOMAINS).map(([key, value]) => [key, { label: value.label, targetPatterns: value.targetPatterns }])) };
}
