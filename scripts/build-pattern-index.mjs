import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import { createReadStream } from "node:fs";

const root = process.cwd();
const registryConfig = JSON.parse(await fs.readFile(path.join(root, "sentinel-registry.json"), "utf8"));
const requestedDomain = process.argv[2];
if (requestedDomain && !registryConfig.domains[requestedDomain]) throw new Error(`Unknown domain: ${requestedDomain}`);
const domains = requestedDomain ? [requestedDomain] : Object.keys(registryConfig.domains);
const sourceRoot = path.join(root, "data");
const outputRoot = path.join(root, "indexes");
const tokenPattern = /[\p{L}\p{N}_-]{2,}/gu;

function tokens(value) { return [...new Set(String(value ?? "").toLocaleLowerCase("id-ID").match(tokenPattern) ?? [])]; }
async function filesFor(dir) { return (await fs.readdir(dir, { withFileTypes: true })).filter((entry) => entry.isFile() && /\.(jsonl|ndjson)$/i.test(entry.name)).map((entry) => path.join(dir, entry.name)); }

const registry = { version: registryConfig.registryVersion, generatedAt: new Date().toISOString(), targetTotalPatterns: requestedDomain ? registryConfig.domains[requestedDomain].targetPatterns : registryConfig.targetTotalPatterns, scope: requestedDomain ?? "all", domains: {}, totalRecords: 0, invalidRecords: 0 };
await fs.mkdir(outputRoot, { recursive: true });
for (const domain of domains) {
  const sourceDir = path.join(sourceRoot, domain);
  const indexDir = path.join(outputRoot, domain);
  await fs.mkdir(indexDir, { recursive: true });
  const index = new Map(); let records = 0; let invalid = 0;
  let files = [];
  try { files = await filesFor(sourceDir); } catch { files = []; }
  for (const file of files) {
    const input = createReadStream(file, { encoding: "utf8" });
    const lines = readline.createInterface({ input, crlfDelay: Infinity });
    for await (const line of lines) {
      if (!line.trim()) continue;
      try {
        const item = JSON.parse(line);
        if (item.domain !== domain || !item.id || !Array.isArray(item.tags) || item.tags.length === 0 || !item.problem || !item.solution || !item.source || typeof item.confidence !== "number" || item.confidence < 0 || item.confidence > 1 || !item.version) { invalid++; continue; }
        records++;
        for (const token of tokens(`${item.id} ${item.tags.join(" ")} ${item.problem} ${item.solution}`)) {
          const bucket = index.get(token) ?? []; bucket.push(item.id); index.set(token, bucket);
        }
      } catch { invalid++; }
    }
    lines.close();
  }
  const sortedIndex = Object.fromEntries([...index.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([token, ids]) => [token, [...new Set(ids)]]));
  await fs.writeFile(path.join(indexDir, "token-index.json"), JSON.stringify(sortedIndex));
  const stats = { domain, targetPatterns: registryConfig.domains[domain].targetPatterns, records, invalidRecords: invalid, tokenCount: index.size, sourceFiles: files.map((file) => path.relative(root, file)), storage: "jsonl-stream" };
  await fs.writeFile(path.join(indexDir, "metadata.json"), JSON.stringify(stats, null, 2) + "\n");
  registry.domains[domain] = stats; registry.totalRecords += records; registry.invalidRecords += invalid;
}
await fs.writeFile(path.join(outputRoot, "registry.json"), JSON.stringify(registry, null, 2) + "\n");
console.log(JSON.stringify(registry, null, 2));
