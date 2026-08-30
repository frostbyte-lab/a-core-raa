import { matchAraaDataset } from "./araa-dataset.js";
import { registrySummary, routeSentinelDomains } from "./sentinel-registry.js";

const sessions = new Map();
const metrics = { requests: 0, chat: 0, analyze: 0, errors: 0 };
const TTL_MS = 30 * 60 * 1000;

export function sanitizeMessages(messages, max = 12) {
  return (Array.isArray(messages) ? messages : []).slice(-max)
    .map((item) => ({ role: item?.role === "assistant" ? "assistant" : "user", content: String(item?.content ?? "").replace(/[\x00-\x1f]/g, " ").slice(0, 4000) }))
    .filter((item) => item.content.trim());
}

export function orchestrateChat({ sessionId, messages, mode = "daily" }) {
  const clean = sanitizeMessages(messages);
  const last = clean.at(-1)?.content ?? "";
  const routing = routeSentinelDomains(last, mode === "daily" ? undefined : mode);
  const matches = matchAraaDataset([last]);
  const selectedDomains = routing.selected.map((domain) => registrySummary().domains[domain].label);
  const hasSession = Boolean(sessionId);
  const memoryKey = hasSession ? String(sessionId).slice(0, 80) : null;
  const previous = memoryKey ? sessions.get(memoryKey) : null;
  const context = previous && Date.now() - previous.updatedAt < TTL_MS ? previous.messages : [];
  const merged = sanitizeMessages([...context, ...clean]);
  if (memoryKey) sessions.set(memoryKey, { updatedAt: Date.now(), messages: merged.slice(-12) });
  return { messages: merged, routing, retrieval: matches.slice(0, 8), selectedDomains, memory: { sessionId: memoryKey, messages: merged.length, ttlMinutes: 30 } };
}

export function recordMetric(name, failed = false) {
  metrics.requests += 1;
  if (name in metrics) metrics[name] += 1;
  if (failed) metrics.errors += 1;
}

export function getMetrics() { return { ...metrics, sessions: sessions.size }; }
