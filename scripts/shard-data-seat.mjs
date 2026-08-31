import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";

const root = process.cwd();
const inputRoot = path.join(root, process.env.DATA_SEAT_INPUT || "data-seat/incoming");
const outputRoot = path.join(root, process.env.DATA_SEAT_OUTPUT || "data-seat/shards");
const maxBytes = Math.max(1, Number(process.env.DATA_SEAT_SHARD_MB || 20)) * 1024 * 1024;
const manifest = { version: 1, generatedAt: new Date().toISOString(), format: "jsonl", maxShardBytes: maxBytes, totalRecords: 0, invalidRecords: 0, shards: [] };

async function filesIn(dir) { try { return (await fsp.readdir(dir, { withFileTypes: true })).filter((e) => e.isFile() && /\.(jsonl|ndjson)$/i.test(e.name)).map((e) => path.join(dir, e.name)); } catch { return []; } }
function domainOf(item) { return String(item?.domain || "general").toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 40) || "general"; }
function valid(item) { return item && typeof item === "object" && item.id && item.problem && item.solution && item.source && item.version && typeof item.confidence === "number" && item.confidence >= 0 && item.confidence <= 1 && Array.isArray(item.tags) && item.tags.length > 0; }
const handles = new Map();
async function getShard(domain, lineBytes) {
  let state = handles.get(domain);
  if (!state || state.bytes + lineBytes > maxBytes) {
    if (state) await new Promise((resolve, reject) => state.stream.end(resolve));
    const number = (manifest.shards.filter((s) => s.domain === domain).length + 1).toString().padStart(5, "0");
    const relative = path.join(domain, `part-${number}.jsonl`);
    const file = path.join(outputRoot, relative);
    await fsp.mkdir(path.dirname(file), { recursive: true });
    state = { domain, relative, bytes: 0, records: 0, stream: fs.createWriteStream(file, { encoding: "utf8" }) };
    handles.set(domain, state);
    manifest.shards.push({ path: path.join("data-seat/shards", relative).replaceAll(path.sep, "/"), domain, bytes: 0, records: 0 });
  }
  return state;
}
for (const file of await filesIn(inputRoot)) {
  const lines = readline.createInterface({ input: fs.createReadStream(file, { encoding: "utf8" }), crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line.trim()) continue;
    const lineBytes = Buffer.byteLength(line + "\n");
    let item; try { item = JSON.parse(line); } catch { manifest.invalidRecords++; continue; }
    if (!valid(item)) { manifest.invalidRecords++; continue; }
    const domain = domainOf(item); const state = await getShard(domain, lineBytes);
    if (!state.stream.write(line + "\n")) await new Promise((resolve) => state.stream.once("drain", resolve));
    state.bytes += lineBytes; state.records++; manifest.totalRecords++;
    const entry = manifest.shards.at(-1); entry.bytes = state.bytes; entry.records = state.records;
  }
  lines.close();
}
await Promise.all([...handles.values()].map((state) => new Promise((resolve, reject) => { state.stream.once("error", reject); state.stream.end(resolve); })));
await fsp.mkdir(outputRoot, { recursive: true });
await fsp.writeFile(path.join(outputRoot, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(manifest, null, 2));
