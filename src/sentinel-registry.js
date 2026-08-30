export const SENTINEL_REGISTRY_VERSION = "0.2.0";

export const CODING_SUBDOMAINS = Object.freeze({
  "internet-network": { targetPatterns: 30_000_000, keywords: ["internet", "network", "tcp", "udp", "socket", "proxy", "router"] },
  "web-html-css": { targetPatterns: 30_000_000, keywords: ["html", "css", "dom", "accessibility", "responsive", "browser"] },
  "javascript-typescript": { targetPatterns: 30_000_000, keywords: ["javascript", "typescript", "node", "frontend", "react", "vue"] },
  "backend-server": { targetPatterns: 30_000_000, keywords: ["backend", "server", "linux", "process", "websocket", "microservice"] },
  "api-url-http-dns": { targetPatterns: 25_000_000, keywords: ["api", "url", "uri", "http", "https", "dns", "tls"] },
  "database-data": { targetPatterns: 25_000_000, keywords: ["database", "sql", "nosql", "data", "etl", "cache", "redis"] },
  "git-github": { targetPatterns: 20_000_000, keywords: ["git", "github", "repository", "branch", "commit", "actions"] },
  "apk-mobile": { targetPatterns: 20_000_000, keywords: ["apk", "android", "mobile", "kotlin", "java", "expo"] },
  "game-development": { targetPatterns: 25_000_000, keywords: ["game", "babylon", "unity", "webgl", "asset", "game-server"] },
  "security-drm": { targetPatterns: 20_000_000, keywords: ["security", "auth", "oauth", "csp", "drm", "eme", "privacy"] },
  "cloud-devops": { targetPatterns: 20_000_000, keywords: ["cloud", "docker", "kubernetes", "ci", "cd", "deployment"] },
  "testing-debugging": { targetPatterns: 25_000_000, keywords: ["test", "debug", "error", "logging", "monitoring", "observability", "performance"] }
});

export const SENTINEL_DOMAINS = Object.freeze({
  internet: { label: "Internet", targetPatterns: 30_000_000_000, keywords: ["internet", "url", "uri", "http", "https", "dns", "tls", "tcp", "ip", "network", "server", "website", "web"] },
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

export function routeCodingTopics(input) {
  const text = normalize(input);
  const scored = Object.entries(CODING_SUBDOMAINS).map(([topic, config]) => [topic, config.keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0)]).filter(([, score]) => score > 0).sort((a, b) => b[1] - a[1]);
  return { selected: scored.map(([topic]) => topic), scores: Object.fromEntries(scored), totalTargetPatterns: Object.values(CODING_SUBDOMAINS).reduce((sum, config) => sum + config.targetPatterns, 0) };
}

export function registrySummary() {
  return { version: SENTINEL_REGISTRY_VERSION, totalTargetPatterns: Object.values(SENTINEL_DOMAINS).reduce((sum, domain) => sum + domain.targetPatterns, 0), domains: Object.fromEntries(Object.entries(SENTINEL_DOMAINS).map(([key, value]) => [key, { label: value.label, targetPatterns: value.targetPatterns }])) };
}
